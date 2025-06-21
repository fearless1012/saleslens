const Module = require("../models/Module");
const Progress = require("../models/Progress");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a new module
exports.createModule = async (req, res) => {
  try {
    const { title, description, content, knowledgeBase } = req.body;

    const module = await Module.create({
      title,
      description,
      content,
      knowledgeBase: knowledgeBase || [],
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      module,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all modules
exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: modules.length,
      modules,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single module
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    // If a trainee is accessing the module, record their progress
    if (req.user.role === "trainee") {
      // Check if progress record exists
      let progress = await Progress.findOne({
        userId: req.user._id,
        moduleId: module._id,
      });

      // If no progress record exists, create one
      if (!progress) {
        progress = await Progress.create({
          userId: req.user._id,
          moduleId: module._id,
          progress: 0,
        });
      }
    }

    res.status(200).json({
      success: true,
      module,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a module
exports.updateModule = async (req, res) => {
  try {
    const { title, description, content, knowledgeBase } = req.body;

    let module = await Module.findById(req.params.id);

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    // Check if user is the creator of the module or an admin
    if (
      module.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to update this module",
        });
    }

    module = await Module.findByIdAndUpdate(
      req.params.id,
      {
        title: title || module.title,
        description: description || module.description,
        content: content || module.content,
        knowledgeBase: knowledgeBase || module.knowledgeBase,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      module,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a module
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    // Check if user is the creator of the module or an admin
    if (
      module.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this module",
        });
    }

    // Remove all progress records associated with this module
    await Progress.deleteMany({ moduleId: module._id });

    // Delete the module
    await module.deleteOne();

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate module content using AI
exports.generateModuleContent = async (req, res) => {
  try {
    const { topic, keyPoints, targetAudience } = req.body;

    if (!topic) {
      return res
        .status(400)
        .json({ success: false, message: "Topic is required" });
    }

    const prompt = `
      Create a comprehensive sales training module on the topic of "${topic}".
      
      ${keyPoints ? `Key points to include: ${keyPoints}` : ""}
      ${
        targetAudience
          ? `The target audience is: ${targetAudience}`
          : "The target audience is new sales hires."
      }
      
      The module should include:
      1. A clear and engaging title
      2. A brief introduction to the topic
      3. Detailed content with relevant examples
      4. At least 5 key learning points
      5. A concise conclusion
      
      Also generate 5 potential knowledge base Q&A pairs that trainees might ask about this topic.
      
      Format the response in JSON with the following structure:
      {
        "title": "Module Title",
        "description": "Brief description of the module",
        "content": "Full module content with sections",
        "knowledgeBase": [
          {
            "question": "Sample question?",
            "answer": "Detailed answer"
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in sales training and education. Your task is to create engaging and informative sales training modules.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const generatedContent = completion.choices[0].message.content;
    let parsedContent;

    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (error) {
      // If JSON parsing fails, extract content manually
      const titleMatch = generatedContent.match(/"title":\s*"([^"]+)"/);
      const descriptionMatch = generatedContent.match(
        /"description":\s*"([^"]+)"/
      );
      const contentMatch = generatedContent.match(/"content":\s*"([^"]+)"/);

      parsedContent = {
        title: titleMatch ? titleMatch[1] : topic,
        description: descriptionMatch
          ? descriptionMatch[1]
          : `Training module about ${topic}`,
        content: contentMatch ? contentMatch[1] : generatedContent,
        knowledgeBase: [],
      };
    }

    res.status(200).json({
      success: true,
      module: parsedContent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update trainee progress
exports.updateProgress = async (req, res) => {
  try {
    const { progress, completed } = req.body;

    // Find the module
    const module = await Module.findById(req.params.id);

    if (!module) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    // Find or create progress record
    let progressRecord = await Progress.findOne({
      userId: req.user._id,
      moduleId: module._id,
    });

    if (!progressRecord) {
      progressRecord = await Progress.create({
        userId: req.user._id,
        moduleId: module._id,
        progress: progress || 0,
        completed: completed || false,
        completedAt: completed ? Date.now() : null,
      });
    } else {
      progressRecord = await Progress.findByIdAndUpdate(
        progressRecord._id,
        {
          progress: progress || progressRecord.progress,
          completed:
            completed !== undefined ? completed : progressRecord.completed,
          completedAt: completed ? Date.now() : progressRecord.completedAt,
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      progress: progressRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get trainee progress for all modules
exports.getTraineeProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).populate({
      path: "moduleId",
      select: "title description createdAt",
    });

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
