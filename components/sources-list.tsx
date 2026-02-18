'use client';

import { ExternalLink, FileText } from 'lucide-react';
import type { Source } from '@/lib/supabase';

interface SourcesListProps {
  sources: Source[];
}

export function SourcesList({ sources }: SourcesListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white font-semibold">
        <FileText className="w-5 h-5 text-cyan-400" />
        <h3>Sources utilisées</h3>
      </div>

      <div className="grid gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800/30 hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium group-hover:text-cyan-400 transition-colors line-clamp-2">
                {source.title}
              </div>
              {source.date && (
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(source.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
