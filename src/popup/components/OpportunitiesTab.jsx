// src/popup/components/OpportunitiesTab.jsx
import React, { useMemo } from 'react';

function OpportunitiesTab({ opportunities, onDelete }) {
  // Group opportunities by stage
  const groupedOpportunities = useMemo(() => {
    const groups = {};
    opportunities.forEach(opp => {
      const stage = opp.stage || 'Unknown';
      if (!groups[stage]) {
        groups[stage] = [];
      }
      groups[stage].push(opp);
    });
    return groups;
  }, [opportunities]);

  const stageOrder = [
    'Prospecting',
    'Qualification',
    'Needs Analysis',
    'Value Proposition',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
    'Unknown'
  ];

  const getStageColor = (stage) => {
    const colors = {
      'Prospecting': 'bg-blue-100 text-blue-800 border-blue-200',
      'Qualification': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Needs Analysis': 'bg-purple-100 text-purple-800 border-purple-200',
      'Value Proposition': 'bg-pink-100 text-pink-800 border-pink-200',
      'Proposal': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Negotiation': 'bg-orange-100 text-orange-800 border-orange-200',
      'Closed Won': 'bg-green-100 text-green-800 border-green-200',
      'Closed Lost': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatAmount = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const sortedStages = Object.keys(groupedOpportunities).sort((a, b) => {
    const aIndex = stageOrder.indexOf(a);
    const bIndex = stageOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return (
    <div className="space-y-4">
      {sortedStages.map(stage => (
        <div key={stage}>
          <div className={`flex items-center justify-between mb-2 px-3 py-2 rounded ${getStageColor(stage)}`}>
            <h3 className="font-semibold">{stage}</h3>
            <span className="text-sm">{groupedOpportunities[stage].length}</span>
          </div>

          <div className="space-y-2">
            {groupedOpportunities[stage].map(opp => (
              <div
                key={opp.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition ml-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{opp.name || 'Unnamed Opportunity'}</h4>
                    {opp.account && (
                      <p className="text-sm text-blue-600">{opp.account}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(opp.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="text-gray-900 font-bold text-lg">{formatAmount(opp.amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Probability:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${opp.probability || 0}%` }}
                        />
                      </div>
                      <span className="text-gray-900 font-semibold">{opp.probability || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Close Date:</span>
                    <p className="text-gray-900">{opp.closeDate || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Owner:</span>
                    <p className="text-gray-900">{opp.owner || 'N/A'}</p>
                  </div>
                  {opp.forecastCategory && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Forecast:</span>
                      <span className="ml-2 text-gray-900">{opp.forecastCategory}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default OpportunitiesTab;