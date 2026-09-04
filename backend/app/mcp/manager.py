import time
from typing import List, Dict, Any, Optional

class MedicalMCPManager:
    def __init__(self):
        self.servers = [
            {
                "id": "mcp-pharmacy",
                "name": "Apollo Pharmacy Refill MCP Server (India)",
                "transport": "stdio",
                "status": "connected",
                "tools": [
                    {
                        "name": "check_medicine_stock",
                        "description": "Checks remaining pills for active patient medications and calculates refill date",
                        "parameters": {"patient_id": "string"},
                        "requires_approval": False
                    },
                    {
                        "name": "order_medication_refill",
                        "description": "Prepares an Apollo Pharmacy India order for patient medication replenishment",
                        "parameters": {"patient_id": "string", "medication_name": "string", "quantity": "number"},
                        "requires_approval": True,
                        "risk_level": "high"
                    }
                ]
            },
            {
                "id": "mcp-calendar",
                "name": "Doctor Consultation Scheduling MCP Server",
                "transport": "sse",
                "status": "connected",
                "tools": [
                    {
                        "name": "check_doctor_availability",
                        "description": "Fetches available consultation slots for specified doctor in IST timezone",
                        "parameters": {"doctor_name": "string", "date": "string"},
                        "requires_approval": False
                    },
                    {
                        "name": "schedule_doctor_appointment",
                        "description": "Books a doctor consultation appointment slot for patient",
                        "parameters": {"patient_id": "string", "doctor_name": "string", "date": "string", "time": "string"},
                        "requires_approval": True,
                        "risk_level": "medium"
                    }
                ]
            },
            {
                "id": "mcp-lab",
                "name": "Dr. Lal PathLabs Diagnostics MCP Server",
                "transport": "stdio",
                "status": "connected",
                "tools": [
                    {
                        "name": "analyze_vitals_trend",
                        "description": "Evaluates blood sugar, SpO2, and BP readings against Indian clinical guidelines",
                        "parameters": {"fasting_sugar": "number", "pp_sugar": "number", "spo2": "number"},
                        "requires_approval": False
                    }
                ]
            }
        ]

    def list_servers(self) -> List[Dict[str, Any]]:
        return self.servers

    def list_all_tools(self) -> List[Dict[str, Any]]:
        tools = []
        for s in self.servers:
            for t in s["tools"]:
                item = dict(t)
                item["server_id"] = s["id"]
                item["server_name"] = s["name"]
                tools.append(item)
        return tools

    def get_tool(self, name: str) -> Optional[Dict[str, Any]]:
        for s in self.servers:
            for t in s["tools"]:
                if t["name"] == name:
                    res = dict(t)
                    res["server_id"] = s["id"]
                    res["server_name"] = s["name"]
                    return res
        return None

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        tool = self.get_tool(tool_name)
        if not tool:
            return {"status": "error", "message": f"Tool {tool_name} not found"}

        if tool_name == "check_medicine_stock":
            return {
                "status": "success",
                "result": "Medication Audit: Metformin 500mg has 6 tablets remaining (Apollo Pharmacy refill recommended in 3 days)."
            }
        elif tool_name == "order_medication_refill":
            med = arguments.get("medication_name", "Metformin 500mg")
            qty = arguments.get("quantity", 30)
            return {
                "status": "success",
                "result": f"Apollo Pharmacy India Order Placed for {qty} tablets of {med}. Express home delivery dispatched to patient address."
            }
        elif tool_name == "check_doctor_availability":
            doc = arguments.get("doctor_name", "Dr. Rajesh Verma")
            return {
                "status": "success",
                "result": f"Available IST Consultation Slots for {doc}: [10:30 AM IST, 03:00 PM IST, 06:30 PM IST]."
            }
        elif tool_name == "schedule_doctor_appointment":
            doc = arguments.get("doctor_name", "Dr. Rajesh Verma")
            date = arguments.get("date", "Tomorrow")
            time_slot = arguments.get("time", "10:30 AM IST")
            return {
                "status": "success",
                "result": f"Consultation Confirmed with {doc} on {date} at {time_slot}."
            }
        elif tool_name == "analyze_vitals_trend":
            fasting = arguments.get("fasting_sugar", 142)
            spo2 = arguments.get("spo2", 98)
            next_sugar = "7 days" if fasting > 130 else "30 days"
            return {
                "status": "success",
                "result": f"Vitals Analysis: Fasting Sugar ({fasting} mg/dL) is Elevated. SpO2 ({spo2}%) is Normal. Recommended Next Blood Sugar Check-Up in {next_sugar}."
            }
        return {"status": "success", "result": f"Executed {tool_name}"}

medical_mcp_instance = MedicalMCPManager()
