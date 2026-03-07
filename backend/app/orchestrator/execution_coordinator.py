from typing import List, Dict, Any
import asyncio
from app.agents.safety_agent import SafetyAgent
from app.agents.specialist_agent import BotanistAgent, EntomologistAgent, ZoologistAgent
from app.agents.support_agent import StorytellerAgent, EducatorAgent

class ExecutionCoordinator:
    def __init__(self):
        self.safety_agent = SafetyAgent()
        self.specialists = {
            "Botanist": BotanistAgent(),
            "Entomologist": EntomologistAgent(),
            "Zoologist": ZoologistAgent()
        }
        self.support_agents = {
            "Storyteller": StorytellerAgent(),
            "Educator": EducatorAgent()
        }

    async def execute_agents(self, agents: List[str], context: Dict[str, Any], discovery_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Orchestrates the execution of selected agents.
        Enforces the C4 flow: Safety -> Specialist -> Support
        """
        results = {}
        
        # 1. Safety Check (Blocking)
        if "SafetyAgent" in agents:
            # safety_result = await self._mock_agent_call("SafetyAgent", context, discovery_input)
            safety_result = await self.safety_agent.evaluate_safety(discovery_input)
            results["SafetyAgent"] = safety_result
            
            if safety_result.get("is_dangerous", False):
                # If unsafe, short-circuit and return immediately
                return results

        # 2. Specialist Consultation (Parallel)
        specialist_tasks = []
        specialist_names = []
        for agent_name in agents:
            if agent_name in self.specialists:
                specialist_tasks.append(self.specialists[agent_name].analyze(discovery_input))
                specialist_names.append(agent_name)
        
        import logging
        logger = logging.getLogger(__name__)

        if specialist_tasks:
            # Handle potential failures from individual specialist agents gracefully
            specialist_results = await asyncio.gather(*specialist_tasks, return_exceptions=True)
            
            # Filter out exceptions and log them
            valid_specialist_results = []
            for name, result in zip(specialist_names, specialist_results):
                if isinstance(result, Exception):
                    logger.error(f"Specialist agent '{name}' failed with error: {str(result)}")
                elif result:
                    valid_specialist_results.append((name, result))
                    
            # Store primary specialist result mapping
            if valid_specialist_results:
                merged_specialist = {}
                for _, res in valid_specialist_results:
                    if isinstance(res, dict):
                        for key, value in res.items():
                            if key not in merged_specialist or not merged_specialist[key]:
                                merged_specialist[key] = value
                            elif isinstance(merged_specialist[key], list) and isinstance(value, list):
                                merged_specialist[key].extend(value)
                
                results["Specialist"] = merged_specialist
                results["AllSpecialists"] = {name: res for name, res in valid_specialist_results}

        # 3. Support Agents (Parallel)
        # Using specialist output to inform support agents
        support_tasks = []
        support_names = []
        specialist_data = results.get("Specialist", {})
        
        for agent_name in agents:
            if agent_name == "Storyteller":
                support_tasks.append(self.support_agents["Storyteller"].generate_story(specialist_data, context))
                support_names.append("Storyteller")
            elif agent_name == "Educator":
                support_tasks.append(self.support_agents["Educator"].generate_activity(specialist_data))
                support_names.append("Educator")
                
        if support_tasks:
            # Handle potential failures from individual support agents gracefully
            support_results = await asyncio.gather(*support_tasks, return_exceptions=True)
            for name, result in zip(support_names, support_results):
                if isinstance(result, Exception):
                    logger.error(f"Support agent '{name}' failed with error: {str(result)}")
                else:
                    results[name] = result

        return results
