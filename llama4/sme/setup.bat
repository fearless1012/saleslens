# Create necessary directories
mkdir logs
mkdir training_data
mkdir "models\finetuned"
mkdir scripts

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

echo "SME RAG System setup complete!"
echo "Please edit .env file with your configuration before starting the server."
echo ""
echo "Required configurations:"
echo "- MONGODB_URI: Your MongoDB connection string"
echo "- NEO4J_URI: Your Neo4j connection URI"
echo "- NEO4J_USER: Your Neo4j username"
echo "- NEO4J_PASSWORD: Your Neo4j password"
echo "- JWT_SECRET: A strong secret for JWT tokens"
echo "- LLAMA_API_KEY: Your Llama API key"
echo ""
echo "To start the server: npm start"
echo "To run development mode: npm run dev"
