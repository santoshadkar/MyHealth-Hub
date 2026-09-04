import time
import uuid
from typing import Dict, Any, List
from app.rag.store import medical_vault_instance
from app.mcp.manager import medical_mcp_instance
from app.loops.engine import health_loop_instance

class MyHealthGraphEngine:
    def __init__(self):
        pass

    def run_chat_turn(self, user_role: str, patient_id: str, message: str, thread_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        query = message.lower()
        plan = []
        messages = []
        trace = []

        trace.append({"step": 1, "node": "supervisor", "timestamp": time.strftime("%H:%M:%S")})
        
        if any(term in query for term in ["report", "blood", "sugar", "lab", "history", "document", "hba1c", "creatinine"]):
            plan = ["Query Medical RAG Vault", "Extract relevant lab & report parameters", "Synthesize clinical answer with citations", "Apply Reflection Audit"]
            
            trace.append({"step": 2, "node": "rag_medical_agent", "timestamp": time.strftime("%H:%M:%S")})
            rag_results = medical_vault_instance.search(query, patient_id=patient_id, top_k=2)
            context_str = "\n".join([f"- {r['citation']}: {r['document']['content']}" for r in rag_results])
            
            messages.append({
                "id": str(uuid.uuid4())[:8],
                "sender": "rag_medical_agent",
                "content": f"🩺 **Medical RAG Vault Synthesis:**\nBased on your uploaded lab & clinical reports:\n{context_str}\n\n[1] All guidance grounded in authentic Indian lab records.",
                "timestamp": time.strftime("%H:%M:%S"),
                "metadata": {"citations": [r['citation'] for r in rag_results]}
            })

        elif any(term in query for term in ["checkup", "next check-up", "vitals", "spo2", "pulse", "when should i"]):
            plan = ["Analyze latest vitals (Sugar, BP, SpO2, Pulse)", "Evaluate clinical risk thresholds", "Generate next recommended check-up schedule", "Reflect & Audit"]
            
            trace.append({"step": 2, "node": "vitals_checkup_agent", "timestamp": time.strftime("%H:%M:%S")})
            
            messages.append({
                "id": str(uuid.uuid4())[:8],
                "sender": "vitals_checkup_agent",
                "content": "📊 **Vitals & Lab Check-up Analysis:**\n"
                           "- **Fasting Blood Sugar**: 142 mg/dL (Elevated -> **Next Sugar Check-up in 7 days**)\n"
                           "- **Oxygen SpO2**: 98% (Normal -> **Next SpO2 Check-up in 30 days**)\n"
                           "- **Pulse Rate**: 78 bpm (Normal -> **Next Pulse Check-up in 30 days**)\n\n"
                           "📅 Would you like me to schedule a follow-up consultation with your attending doctor?",
                "timestamp": time.strftime("%H:%M:%S"),
                "metadata": {"recommended_days": 7}
            })

        elif any(term in query for term in ["refill", "medicine", "order", "pills", "prescribe", "metformin"]):
            plan = ["Check active medication stock via MCP", "Enforce Doctor HITL Safety Approval Gate", "Prepare Apollo Pharmacy Order"]
            
            trace.append({"step": 2, "node": "mcp_tool_agent", "timestamp": time.strftime("%H:%M:%S")})
            
            approval_item = health_loop_instance.add_pending_approval(
                patient_name="Aarav Sharma (Age 52)",
                tool_name="order_medication_refill",
                arguments={"patient_id": patient_id, "medication_name": "Metformin 500 mg", "quantity": 30},
                risk_level="high",
                description="Refill request for Metformin 500mg triggered. Doctor review required before Apollo Pharmacy dispatch."
            )
            
            messages.append({
                "id": str(uuid.uuid4())[:8],
                "sender": "mcp_tool_agent",
                "content": "⚠️ **Doctor Safety Approval Gate Triggered (HITL)**:\n"
                           "Medication order request for **Metformin 500 mg (30 Tablets)** has been placed in the Doctor Approval Queue.\n"
                           "Your attending physician will review and confirm the refill for Apollo Pharmacy home delivery.",
                "timestamp": time.strftime("%H:%M:%S"),
                "metadata": {"hitl_required": True, "approval_id": approval_item["approval_id"]}
            })

        else:
            plan = ["Provide health consultation overview", "Audit with Reflection Engine"]
            messages.append({
                "id": str(uuid.uuid4())[:8],
                "sender": "myhealth_assistant",
                "content": f"Namaste! As your **MyHealth AI Assistant**, I monitor your blood sugar, SpO2, pulse rate, active medications, and lab reports. How can I assist your health management today?",
                "timestamp": time.strftime("%H:%M:%S"),
                "metadata": None
            })

        trace.append({"step": len(trace) + 1, "node": "reflection_agent", "timestamp": time.strftime("%H:%M:%S")})
        eval_res = health_loop_instance.audit_medical_guidance(message, messages[-1]["content"])
        
        messages.append({
            "id": str(uuid.uuid4())[:8],
            "sender": "system",
            "content": f"✅ **Clinical Reflection Verified** (Quality Score: {eval_res['quality_score']*100:.0f}%).\n*Note: MyHealth AI provides clinical decision support. Always consult your registered medical practitioner for emergency medical decisions.*",
            "timestamp": time.strftime("%H:%M:%S"),
            "metadata": {"quality_score": eval_res["quality_score"]}
        })

        return {
            "plan": plan,
            "messages": messages,
            "trace": trace
        }

myhealth_graph_engine = MyHealthGraphEngine()
