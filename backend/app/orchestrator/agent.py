from app.orchestrator.context_loader import ContextLoader
from app.orchestrator.prompt_builder import PromptBuilder
from app.orchestrator.agent_router import AgentRouter
from app.orchestrator.execution_coordinator import ExecutionCoordinator
from app.orchestrator.response_synthesizer import ResponseSynthesizer

class PipOrchestrator:
    def __init__(self):
        self.name = "Pip Orchestrator"
        self.context_loader = ContextLoader()
        self.prompt_builder = PromptBuilder()
        self.agent_router = AgentRouter()
        self.execution_coordinator = ExecutionCoordinator()
        self.response_synthesizer = ResponseSynthesizer()
        
    async def process_discovery(self, discovery_input: dict):
        """
        Main entry point for processing a child's discovery.
        """
        child_id = discovery_input.get("child_id", "default_child")
        
        # 1. Context Loading
        context = await self.context_loader.load_context(child_id)
        
        # 2. Prompt Construction (Optional for this flow if using specific agents, 
        # but good for the Synthesizer or a Generalist agent)
        system_instruction = self.prompt_builder.build_system_instruction(context)
        context["system_instruction"] = system_instruction
        
        # 3. Agent Routing
        required_agents = self.agent_router.route_discovery(discovery_input)
        print(f"Routing to agents: {required_agents}")
        
        # 4. Execution Coordination
        agent_results = await self.execution_coordinator.execute_agents(
            required_agents, context, discovery_input
        )
        
        # 5. Response Synthesis
        response = self.response_synthesizer.synthesize_response(agent_results, context)
        
        return response
