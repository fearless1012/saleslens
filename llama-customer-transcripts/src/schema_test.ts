import { LlamaKnowledgeGraphService } from './llamaService';

// Test the schema complexity without making API calls
function testSchemaComplexity() {
  console.log('🧪 Testing JSON Schema Complexity...');
  
  try {
    // Create service instance with dummy API key
    const service = new LlamaKnowledgeGraphService('test-key');
    
    // Access the private method via reflection to test schema
    const schema = (service as any).getEnhancedKnowledgeGraphSchema();
    
    // Calculate schema depth
    function calculateDepth(obj: any, currentDepth = 0): number {
      if (typeof obj !== 'object' || obj === null) {
        return currentDepth;
      }
      
      let maxDepth = currentDepth;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const depth = calculateDepth(obj[key], currentDepth + 1);
          maxDepth = Math.max(maxDepth, depth);
        }
      }
      return maxDepth;
    }
    
    const schemaDepth = calculateDepth(schema);
    console.log(`📏 Schema depth: ${schemaDepth} levels`);
    console.log(`📊 Schema size: ${JSON.stringify(schema).length} characters`);
    
    // Show schema structure
    console.log('\n🏗️ Schema Structure:');
    console.log(`   • Top level properties: ${Object.keys(schema.properties || {}).length}`);
    console.log(`   • Required fields: ${(schema.required || []).length}`);
    
    if (schema.properties?.nodes?.items?.properties) {
      console.log(`   • Node properties: ${Object.keys(schema.properties.nodes.items.properties).length}`);
    }
    
    if (schema.properties?.edges?.items?.properties) {
      console.log(`   • Edge properties: ${Object.keys(schema.properties.edges.items.properties).length}`);
    }
    
    if (schema.properties?.insights?.properties) {
      console.log(`   • Insight properties: ${Object.keys(schema.properties.insights.properties).length}`);
    }
    
    // Validate depth is reasonable (typically should be < 10 for Llama API)
    if (schemaDepth <= 8) {
      console.log('✅ Schema depth is within acceptable limits');
    } else {
      console.log('⚠️ Schema depth might be too deep for Llama API');
    }
    
    console.log('\n🎉 Schema complexity test completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema test failed:', error);
  }
}

// Run the test
testSchemaComplexity();
