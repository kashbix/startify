import React, { useState, useEffect } from 'react';
import api from '../../services/api';


const COLUMNS = ["Matched", "Contacted", "Meeting Booked", "Due Diligence", "Term Sheet", "Passed"];

export const CRMBoardPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch CRM Data
  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await api.get('/crm');
      setLeads(res.data);
    } catch (err) {
      console.error("Failed to load pipeline", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Dragging
  const handleDragStart = (e: React.DragEvent, leadId: str) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    
    // Optimistic UI Update (move it instantly on screen)
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, stage: targetStage } : lead
    ));

    // Send update to FastAPI
    try {
      await api.put(`/crm/${leadId}`, { stage: targetStage });
    } catch (err) {
      console.error("Failed to update stage", err);
      fetchPipeline(); // Revert if backend fails
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Pipeline...</div>;

  return (
    <div className="font-['Inter'] h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fundraising Pipeline</h1>
        <p className="text-gray-500">Drag and drop investors to track your raise.</p>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map(column => (
          <div 
            key={column}
            className="bg-gray-50 rounded-xl min-w-[300px] w-[300px] flex flex-col border border-gray-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-700">{column}</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                {leads.filter(l => l.stage === column).length}
              </span>
            </div>

            {/* Cards List */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
              {leads.filter(l => l.stage === column).map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors"
                >
                  <h4 className="font-semibold text-gray-900">{lead.investor_name}</h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {lead.investor_type}
                    </span>
                    <span>📍 {lead.investor_hq}</span>
                  </div>
                </div>
              ))}
              
              {leads.filter(l => l.stage === column).length === 0 && (
                 <div className="h-full flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg py-8">
                   Drop here
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};