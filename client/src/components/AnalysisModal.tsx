import React from 'react';
import { FileText, Zap, Lightbulb, Settings, X, Loader2, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
  isLoading?: boolean;
  notesAnalyzed?: number;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading = false,
  notesAnalyzed = 0
}) => {
  if (!isOpen) return null;

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="w-5 h-5" />;
      case 'exercise':
        return <Zap className="w-5 h-5" />;
      case 'technique':
        return <Lightbulb className="w-5 h-5" />;
      case 'tool':
        return <Settings className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800';
      case 'exercise':
        return 'bg-green-100 text-green-800';
      case 'technique':
        return 'bg-purple-100 text-purple-800';
      case 'tool':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-500 to-gold-400 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full mr-3 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mental Health Analysis</h2>
                {notesAnalyzed > 0 && (
                  <p className="text-white text-opacity-90 text-sm">
                    Based on {notesAnalyzed} recent journal entries
                  </p>
                )}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
              <p className="text-sage-600 font-serif">Analyzing your journal entries...</p>
              <p className="text-sage-500 text-sm mt-2">This may take a moment</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Analysis Section */}
              <div className="bg-sage-50 rounded-xl p-6 border border-sage-200">
                <h3 className="text-lg font-semibold text-sage-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Analysis Summary
                </h3>
                <p className="text-sage-800 font-serif leading-relaxed">{analysis.analysis}</p>
              </div>

              {/* Resources Section */}
              <div>
                <h3 className="text-lg font-semibold text-sage-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Recommended Resources
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {analysis.resources.map((resource, index) => (
                    <div key={index} className="bg-white border border-sage-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-sage-100 rounded-lg mr-3 flex items-center justify-center text-sage-600">
                            {getResourceIcon(resource.type)}
                          </div>
                          <h4 className="font-semibold text-sage-900">{resource.title}</h4>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResourceTypeColor(resource.type)}`}>
                          {resource.type}
                        </span>
                      </div>
                      <p className="text-sage-700 text-sm leading-relaxed mb-3">{resource.description}</p>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sage-600 hover:text-sage-700 text-sm font-medium transition-colors"
                        >
                          Learn more
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Section */}
              <div className="bg-gold-50 rounded-xl p-6 border border-gold-200">
                <h3 className="text-lg font-semibold text-gold-900 mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Gentle Recommendations
                </h3>
                <p className="text-gold-800 font-serif leading-relaxed">{analysis.recommendations}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
              <p className="text-gray-600">Unable to load analysis results.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
