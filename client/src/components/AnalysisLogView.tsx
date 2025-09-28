import React, { useState, useEffect } from 'react';
import { Zap, Edit, FileText, X, AlertCircle, ExternalLink, Lightbulb } from 'lucide-react';
import { AnalysisLog, AnalysisResult } from '../types';
import { apiService } from '../services/api';

interface AnalysisLogViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalysisLogView: React.FC<AnalysisLogViewProps> = ({
  isOpen,
  onClose
}) => {
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AnalysisLog | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAnalysisLogs();
    }
  }, [isOpen]);

  const loadAnalysisLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAnalysisLogs();
      setLogs(response.logs);
    } catch (error) {
      console.error('Error loading analysis logs:', error);
      setError('Failed to load analysis logs');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTriggerTypeColor = (type: string) => {
    return type === 'automatic' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getTriggerTypeIcon = (type: string) => {
    return type === 'automatic' ? (
      <Zap className="w-4 h-4" />
    ) : (
      <Edit className="w-4 h-4" />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-500 to-gold-400 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full mr-3 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Analysis History</h2>
                <p className="text-white text-opacity-90 text-sm">
                  View your mental health analysis logs
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white text-opacity-80 hover:text-opacity-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Logs List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-sage-900 mb-4">Analysis Logs</h3>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-2"></div>
                  <p className="text-sage-600 text-sm">Loading logs...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-red-600 text-sm mb-2">{error}</p>
                  <button
                    onClick={loadAnalysisLogs}
                    className="text-sage-600 hover:text-sage-700 text-sm font-medium"
                  >
                    Try again
                  </button>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm">No analysis logs yet</p>
                  <p className="text-gray-500 text-xs mt-1">Create notes and analyze them to see logs here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.log_id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedLog?.log_id === log.log_id
                          ? 'border-sage-300 bg-sage-50'
                          : 'border-gray-200 hover:border-sage-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-sage-100 rounded-full mr-2 flex items-center justify-center">
                            {getTriggerTypeIcon(log.trigger_type)}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerTypeColor(log.trigger_type)}`}>
                            {log.trigger_type}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
                        {log.notes_analyzed.length} notes analyzed
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.generated_resources.resources.length} resources generated
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Log Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedLog ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-sage-900">Analysis Details</h3>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-sage-100 rounded-full mr-2 flex items-center justify-center">
                        {getTriggerTypeIcon(selectedLog.trigger_type)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerTypeColor(selectedLog.trigger_type)}`}>
                        {selectedLog.trigger_type}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Analyzed on {formatDate(selectedLog.created_at)} • {selectedLog.notes_analyzed.length} notes
                  </p>
                </div>

                {/* Analysis Summary */}
                <div className="bg-sage-50 rounded-xl p-6 border border-sage-200 mb-6">
                  <h4 className="text-md font-semibold text-sage-900 mb-3">Analysis Summary</h4>
                  <p className="text-sage-800 font-serif leading-relaxed">
                    {selectedLog.generated_resources.analysis}
                  </p>
                </div>

                {/* Resources */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-sage-900 mb-4">Generated Resources</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedLog.generated_resources.resources.map((resource, index) => (
                      <div key={index} className="bg-white border border-sage-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sage-900">{resource.title}</h5>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-sage-100 text-sage-800">
                            {resource.type}
                          </span>
                        </div>
                        <p className="text-sage-700 text-sm leading-relaxed">{resource.description}</p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sage-600 hover:text-sage-700 text-sm font-medium mt-2 transition-colors"
                          >
                            Learn more
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gold-50 rounded-xl p-6 border border-gold-200">
                  <h4 className="text-md font-semibold text-gold-900 mb-3">Recommendations</h4>
                  <p className="text-gold-800 font-serif leading-relaxed">
                    {selectedLog.generated_resources.recommendations}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Log</h3>
                  <p className="text-gray-600">Choose an analysis log from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
