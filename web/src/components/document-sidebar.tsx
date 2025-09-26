"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Plus,
  Link as LinkIcon,
  List,
  ChevronDown,
  Workflow,
  Clock,
  User,
  Flag,
  PanelLeft,
  MessageCirclePlus,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Send,
  Bot,
} from "lucide-react";

export default function ContractLayout() {
  const [activeTab, setActiveTab] = useState("contract");
  const [openRelated, setOpenRelated] = useState(true);
  const [openPT, setOpenPT] = useState(true);
  const [openContract, setOpenContract] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for workflow sections
  const [openReview, setOpenReview] = useState(false);
  const [openApproval, setOpenApproval] = useState(false);
  const [openSignatories, setOpenSignatories] = useState(false);
  const [openAcknowledgement, setOpenAcknowledgement] = useState(false);

  // State for flags sections
  const [openCriticalIssues, setOpenCriticalIssues] = useState(true);
  const [openWarnings, setOpenWarnings] = useState(true);
  const [openSuggestions, setOpenSuggestions] = useState(true);
  const [openResolved, setOpenResolved] = useState(false);

  // State for contributors
  const [contributors, setContributors] = useState([
    { name: "Andhika Fadillah ", role: "Can edit", color: "bg-orange-500" },
    { name: "Gracya Sidabutar", role: "Can edit", color: "bg-rose-500" },
    { name: "Satriadhikara Panji", role: "Can view", color: "bg-blue-500" },
    { name: "Yusril Fazri Mahendra", role: "Can view", color: "bg-indigo-500" },
    { name: "Farrel Natha", role: "Can view", color: "bg-green-500" },
  ]);

  // State for flags/issues
  const [flags, setFlags] = useState({
    critical: [
      {
        id: 1,
        name: "Audit",
        resolved: false,
        description:
          "The contract lacks essential audit clauses that are required for compliance and risk management. This creates significant legal exposure.",
        details:
          "Audit clauses are critical for ensuring transparency, accountability, and regulatory compliance. Without proper audit provisions, the organization may face difficulties in financial reporting, compliance verification, and risk assessment.",
      },
    ],
    warnings: [
      {
        id: 4,
        name: "Force Majeure",
        resolved: false,
        description:
          "The Force Majeure clause contains unacceptable terms that may expose the organization to unnecessary risks during extraordinary circumstances.",
        details:
          "The current Force Majeure clause is overly restrictive and fails to provide adequate protection for both parties. Key issues include: (1) Limited scope of qualifying events - the clause doesn't cover modern risks like cyber attacks, pandemics, or supply chain disruptions; (2) Unrealistic notification requirements - the 48-hour notice period is impractical for many force majeure events; (3) Inadequate relief provisions - the clause doesn't specify clear procedures for contract suspension or termination; (4) Unbalanced risk allocation - one party bears disproportionate responsibility during force majeure events. Recommendation: Revise to include comprehensive event coverage, reasonable notification periods (7-14 days), clear relief procedures, and balanced risk allocation between parties.",
      },
      {
        id: 5,
        name: "Confidentiality",
        resolved: false,
        description:
          "Confidentiality provisions are insufficient and may not adequately protect sensitive information.",
        details:
          "The confidentiality clause lacks comprehensive coverage of information types, has unclear duration terms, and doesn't specify proper handling procedures for sensitive data. This could lead to intellectual property theft or data breaches.",
      },
    ],
    suggestions: [
      {
        id: 7,
        name: "Outsourcing",
        resolved: false,
        description:
          "Outsourcing clauses could be improved to better manage vendor relationships and service quality.",
        details:
          "Current outsourcing provisions lack detailed service level agreements, performance metrics, and quality assurance requirements. Consider adding specific deliverables, timelines, and penalty clauses.",
      },
      {
        id: 8,
        name: "Undeclared work",
        resolved: false,
        description:
          "The contract may contain undeclared work provisions that could lead to scope creep.",
        details:
          "Unclear work definitions and lack of change management procedures could result in disputes over additional work and costs. Recommend adding detailed scope statements and change request procedures.",
      },
    ],
  });

  // State for expanded flag details
  const [expandedFlag, setExpandedFlag] = useState<number | null>(null);

  // State for chat
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Manta AI, your contract analysis assistant. How can I help you with your contract today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Function to handle role changes
  const handleRoleChange = (index: number, newRole: string) => {
    setContributors((prev) =>
      prev.map((contributor, i) =>
        i === index ? { ...contributor, role: newRole } : contributor,
      ),
    );
  };

  // Function to toggle flag resolution
  const toggleFlagResolution = (
    category: keyof typeof flags,
    flagId: number,
  ) => {
    setFlags((prev) => ({
      ...prev,
      [category]: prev[category].map((flag) =>
        flag.id === flagId ? { ...flag, resolved: !flag.resolved } : flag,
      ),
    }));
  };

  // Function to toggle flag details expansion
  const toggleFlagExpansion = (flagId: number | null) => {
    setExpandedFlag(flagId);
  };

  // Function to send message
  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple bot response logic
  const getBotResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("clause") || lowerMessage.includes("term")) {
      return "I can help you analyze specific clauses in your contract. Which clause would you like me to review? I can check for completeness, clarity, and potential risks.";
    } else if (
      lowerMessage.includes("risk") ||
      lowerMessage.includes("issue")
    ) {
      return "Based on my analysis, I've identified several areas of concern in your contract. The most critical issues are in the audit section and force majeure clauses. Would you like me to explain these in detail?";
    } else if (
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("suggest")
    ) {
      return "I recommend addressing the missing audit clause first, as it poses the highest risk. I can also suggest improvements to your confidentiality and outsourcing terms. Which would you like to tackle first?";
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm here to help you with contract analysis and recommendations. Feel free to ask me about specific clauses, risk assessment, or contract improvements.";
    } else {
      return "I understand you're asking about your contract. I can help with clause analysis, risk assessment, compliance checking, and providing recommendations. Could you be more specific about what aspect you'd like me to focus on?";
    }
  };

  return (
    <div className="flex h-screen">
      {/* LEFT NAVIGATION */}
      <nav className="w-14 border-r bg-white flex flex-col items-center py-4 space-y-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <PanelLeft className="w-6 h-6" />
        </button>
        <IconButton
          icon={<List className="w-5 h-5 cursor-pointer" />}
          active={activeTab === "contract"}
          onClick={() => setActiveTab("contract")}
        />
        <IconButton
          icon={<Clock className="w-5 h-5 cursor-pointer" />}
          active={activeTab === "activities"}
          onClick={() => setActiveTab("activities")}
        />
        <IconButton
          icon={<User className="w-5 h-5 cursor-pointer" />}
          active={activeTab === "people"}
          onClick={() => setActiveTab("people")}
        />
        <IconButton
          icon={<Workflow className="w-5 h-5 cursor-pointer" />}
          active={activeTab === "workflow"}
          onClick={() => setActiveTab("workflow")}
        />
        <IconButton
          icon={<Flag className="w-5 h-5 cursor-pointer" />}
          active={activeTab === "flags"}
          onClick={() => setActiveTab("flags")}
        />
        <IconButton
          icon={<MessageCirclePlus className="w-5 h-5 cursor-pointer" />}
          active={activeTab === "Manta"}
          onClick={() => setActiveTab("manta")}
        />
      </nav>

      {/* RIGHT CONTENT */}
      {sidebarOpen && (
        <aside className="w-80 border-l bg-white flex flex-col shrink-0 transition-all duration-300">
          {/* CONTRACT TAB */}
          {activeTab === "contract" && (
            <>
              <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-medium text-gray-700">
                  Contract Information
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <Collapsible open={openRelated} onOpenChange={setOpenRelated}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors">
                    Related Contracts
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openRelated ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-2 h-8 text-xs"
                    >
                      <LinkIcon className="w-3 h-3" />
                      Link to another contract
                    </Button>
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-2" />

                <Collapsible open={openPT} onOpenChange={setOpenPT}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors">
                    PT ABC
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openPT ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    <div className="rounded-md border p-3 text-sm space-y-2 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">
                          PT ABC
                        </span>
                        <Pencil className="w-3 h-3 text-gray-500 cursor-pointer hover:text-gray-700" />
                      </div>
                      <p className="text-xs text-gray-600">
                        Counterparty: PT ABC
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-4" />

                <Collapsible open={openContract} onOpenChange={setOpenContract}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors">
                    Contract
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openContract ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="space-y-4 text-sm">
                      <Row label="Template" value="None" editable />
                      <Row label="Folder" value="Repository" editable />
                      <Row label="Signage date" value="Add" editable />
                      <Row label="Start date" value="Add" editable />
                      <Row label="Initial end date" value="Add" editable />
                      <Row label="Renewal type" value="None" editable />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </>
          )}

          {/* ACTIVITIES TAB */}
          {activeTab === "activities" && (
            <div className="flex-1 py-4 overflow-y-auto">
              <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-medium text-gray-700">
                  Activities
                </h2>
              </div>
              <ul className="space-y-5 text-sm mt-5 px-2">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                    A
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <strong>Andhika Fadillah</strong> has created the project{" "}
                    </div>
                    <span className="text-gray-500 text-xs">3h ago</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                    A
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <strong>Andhika Fadillah</strong> added{" "}
                      <strong>Gracya Sidabutar</strong> as contributor{" "}
                    </div>
                    <span className="text-gray-500 text-xs">3h ago</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                    A
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <strong>Andhika Fadillah</strong> added{" "}
                      <strong>Gracya Sidabutar</strong> as contributor{" "}
                    </div>
                    <span className="text-gray-500 text-xs">3h ago</span>
                  </div>
                </li>
              </ul>
            </div>
          )}

          {/* CONTRIBUTORS TAB */}
          {activeTab === "people" && (
            <div className="flex-1 py-4 overflow-y-auto">
              <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-medium text-gray-700">
                  Contributors
                </h2>
              </div>
              <ul className="space-y-5 text-sm mt-5 px-4">
                {contributors.map((contributor, index) => (
                  <Contributor
                    key={contributor.name}
                    name={contributor.name}
                    role={contributor.role}
                    color={contributor.color}
                    onRoleChange={(newRole) => handleRoleChange(index, newRole)}
                  />
                ))}
              </ul>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-xs text-blue-600"
              >
                + Add contributor
              </Button>
            </div>
          )}

          {/* WORKFLOW TAB */}
          {activeTab === "workflow" && (
            <div className="flex-1 py-4 overflow-y-auto">
              <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-medium text-gray-700">
                  Automated Workflow
                </h2>
              </div>
              <div className="p-3 space-y-4">
                {/* Review Section */}
                <Collapsible open={openReview} onOpenChange={setOpenReview}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors p-2 rounded hover:bg-gray-50">
                    Review
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openReview ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <WorkflowSection
                      title="Review"
                      users={["Yusril Fazri Mahendra", "Farrel Natha"]}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-2" />

                {/* Approval Section */}
                <Collapsible open={openApproval} onOpenChange={setOpenApproval}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors p-2 rounded hover:bg-gray-50">
                    Approval
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openApproval ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <WorkflowSection
                      title="Approval"
                      users={["Yusril Fazri Mahendra", "Farrel Natha"]}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-2" />

                {/* Signatories Section */}
                <Collapsible
                  open={openSignatories}
                  onOpenChange={setOpenSignatories}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors p-2 rounded hover:bg-gray-50">
                    Signatories
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openSignatories ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <WorkflowSection
                      title="Signatories"
                      users={["Satriadhikara Panji"]}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-2" />

                {/* Acknowledgement Section */}
                <Collapsible
                  open={openAcknowledgement}
                  onOpenChange={setOpenAcknowledgement}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors p-2 rounded hover:bg-gray-50">
                    Acknowledgement
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAcknowledgement ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <WorkflowSection
                      title="Acknowledgement"
                      users={["Jonathan Saragih", "Lina Azizah"]}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          )}

          {/* FLAGS TAB - MANTA'S ANALYSIS */}
          {activeTab === "flags" && (
            <div className="flex-1 py-4 overflow-y-auto">
              <div className="px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium text-gray-700">
                    Manta's Analysis
                  </h2>
                </div>
              </div>

              <div className="p-3 space-y-4">
                {/* Critical Issues */}
                <Collapsible
                  open={openCriticalIssues}
                  onOpenChange={setOpenCriticalIssues}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-gray-500" />
                      <span>Missing</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openCriticalIssues ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <FlagsSection
                      flags={flags.critical}
                      category="critical"
                      onToggle={toggleFlagResolution}
                      expandedFlag={expandedFlag}
                      onToggleExpand={toggleFlagExpansion}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-2" />

                {/* Warnings */}
                <Collapsible open={openWarnings} onOpenChange={setOpenWarnings}>
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-[#F04438]" />
                      <span>Unacceptable</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openWarnings ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <FlagsSection
                      flags={flags.warnings}
                      category="warnings"
                      onToggle={toggleFlagResolution}
                      expandedFlag={expandedFlag}
                      onToggleExpand={toggleFlagExpansion}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Separator className="my-2" />

                {/* Suggestions */}
                <Collapsible
                  open={openSuggestions}
                  onOpenChange={setOpenSuggestions}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium hover:text-gray-600 transition-colors p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-[#12B76A]" />
                      <span>Acceptable</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openSuggestions ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <FlagsSection
                      flags={flags.suggestions}
                      category="suggestions"
                      onToggle={toggleFlagResolution}
                      expandedFlag={expandedFlag}
                      onToggleExpand={toggleFlagExpansion}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          )}

          {/* MANTA CHAT TAB */}
          {activeTab === "manta" && (
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#1E609E]" />
                  <h2 className="text-sm font-medium text-gray-700">
                    Manta AI Assistant
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your AI-powered contract consultant
                </p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 ${
                        message.sender === "user"
                          ? "bg-[#1E609E]"
                          : "bg-gradient-to-r from-blue-500 to-purple-600"
                      }`}
                    >
                      {message.sender === "user" ? (
                        "U"
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[200px] ${message.sender === "user" ? "items-end" : "items-start"} flex flex-col`}
                    >
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          message.sender === "user"
                            ? "bg-[#1E609E] text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        {message.text}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-1">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 border-t bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask Manta about your contract..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E609E] focus:border-transparent"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="sm"
                    className="bg-[#1E609E] hover:bg-[#1E609E]/90 text-white px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

// Icon button for sidebar
function IconButton({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-all duration-200 ${
        active
          ? "bg-[#F5FAFF] text-[#1E609E]"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {icon}
    </button>
  );
}

// Field row
function Row({
  label,
  value,
  editable,
  isAdd,
}: {
  label: string;
  value: string;
  editable?: boolean;
  isAdd?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 group hover:bg-gray-50 rounded px-2 -mx-2 transition-colors">
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p
          className={`text-sm ${
            isAdd
              ? "text-blue-600 cursor-pointer hover:text-blue-700"
              : "text-gray-700"
          }`}
        >
          {value}
        </p>
      </div>
      {editable && (
        <Pencil className="w-3 h-3 text-gray-500 cursor-pointer hover:text-gray-700 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
    </div>
  );
}

// Contributor component
function Contributor({
  name,
  role,
  color,
  onRoleChange,
}: {
  name: string;
  role: string;
  color: string;
  onRoleChange?: (newRole: string) => void;
}) {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className={`w-6 h-6 flex items-center justify-center rounded-full text-white text-xs ${color}`}
        >
          {name.charAt(0)}
        </span>
        <span className="text-gray-800 text-sm">{name}</span>
      </div>
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[100px] h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Can edit">Can edit</SelectItem>
          <SelectItem value="Can view">Can view</SelectItem>
          <SelectItem value="Admin">Admin</SelectItem>
          <SelectItem value="Owner">Owner</SelectItem>
        </SelectContent>
      </Select>
    </li>
  );
}

// Workflow section component
function WorkflowSection({ title, users }: { title: string; users: string[] }) {
  return (
    <div className="px-2 pb-2">
      <ul className="space-y-2">
        {users.map((u, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs">
              {u.charAt(0)}
            </span>
            {u}
          </li>
        ))}
      </ul>

      <Button
        variant="ghost"
        size="sm"
        className="mt-4 text-xs text-gray-600 hover:text-gray-700 px-0 h-auto cursor-pointer"
      >
        + Add {title.toLowerCase().slice(0, -1)}
        {title === "Acknowledgement" ? "" : "r"}
      </Button>

      <div className="flex flex-col gap-2 mt-3 text-xs text-gray-600">
        <h1>Type</h1>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            <input type="radio" name={title} /> Serial
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name={title} /> Parallel
          </label>
        </div>
      </div>
    </div>
  );
}

// Flags section component
function FlagsSection({
  flags,
  category,
  onToggle,
  expandedFlag,
  onToggleExpand,
}: {
  flags: Array<{
    id: number;
    name: string;
    resolved: boolean;
    description: string;
    details: string;
  }>;
  category: "critical" | "warnings" | "suggestions";
  onToggle: (
    category: "critical" | "warnings" | "suggestions",
    flagId: number,
  ) => void;
  expandedFlag: number | null;
  onToggleExpand: (flagId: number | null) => void;
}) {
  const getCategoryColor = () => {
    switch (category) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warnings":
        return "bg-orange-50 border-orange-200";
      case "suggestions":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getIconColor = () => {
    switch (category) {
      case "critical":
        return "text-red-600";
      case "warnings":
        return "text-orange-600";
      case "suggestions":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="px-2 pb-2">
      <ul className="space-y-3">
        {flags.map((flag) => (
          <li
            key={flag.id}
            className={`rounded-lg border ${getCategoryColor()}`}
          >
            <div className="p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={flag.resolved}
                  onCheckedChange={() => onToggle(category, flag.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`text-sm font-medium ${flag.resolved ? "line-through text-gray-500" : "text-gray-800"}`}
                    >
                      {flag.name}
                    </h4>
                    <button
                      onClick={() =>
                        onToggleExpand(
                          expandedFlag === flag.id ? null : flag.id,
                        )
                      }
                      className={`ml-2 p-1 rounded-md hover:bg-gray-200 transition-colors ${getIconColor()}`}
                      title="View details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  <p
                    className={`text-xs ${flag.resolved ? "text-gray-400" : "text-gray-600"} mb-2`}
                  >
                    {flag.description}
                  </p>
                  {flag.resolved && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Details Section */}
            {expandedFlag === flag.id && (
              <div className="border-t border-gray-200 bg-white/50 p-4">
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${getIconColor()}`} />
                    Detailed Analysis
                  </h5>
                  <div className="text-xs text-gray-700 leading-relaxed space-y-2">
                    {flag.details.split(". ").map((sentence, index) => (
                      <p key={index}>
                        {sentence}
                        {sentence.endsWith(".") ? "" : "."}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Action buttons for critical/warning items */}
                {(category === "critical" || category === "warnings") &&
                  !flag.resolved && (
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-3 border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          /* Handle suggest revision */
                        }}
                      >
                        Preview
                      </Button>
                    </div>
                  )}

                {/* Recommendation for suggestions */}
                {category === "suggestions" && !flag.resolved && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-3 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => {
                        /* Handle implement suggestion */
                      }}
                    >
                      Implement Suggestion
                    </Button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {flags.length === 0 && (
        <div className="text-center py-4 text-xs text-gray-500">
          No issues in this category
        </div>
      )}
    </div>
  );
}
