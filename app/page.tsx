'use client';

import { useState, useEffect } from 'react';
import { supabase, type Podcast } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Radio, Sparkles, ExternalLink, Clock, Calendar, LogOut } from 'lucide-react';
import { PodcastPlayer } from '@/components/podcast-player';
import { SourcesList } from '@/components/sources-list';

function HomePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [recentPodcasts, setRecentPodcasts] = useState<Podcast[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadRecentPodcasts();
  }, []);

  const loadRecentPodcasts = async () => {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data && !error) {
      setRecentPodcasts(data);
      if (data.length > 0 && data[0].status === 'ready') {
        setCurrentPodcast(data[0]);
      }
    }
  };

  const generatePodcast = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const session = await supabase.auth.getSession();
      
      if (!session.data.session) {
        throw new Error('Vous devez être connecté pour générer un podcast');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-podcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate podcast');
      }

      const data = await response.json();

      const { data: podcast, error: fetchError } = await supabase
        .from('podcasts')
        .select('*')
        .eq('id', data.id)
        .single();

      if (podcast && !fetchError) {
        setCurrentPodcast(podcast);
        await loadRecentPodcasts();
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectPodcast = (podcast: Podcast) => {
    if (podcast.status === 'ready') {
      setCurrentPodcast(podcast);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,149,255,0.05),transparent_50%)]" />

      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{user?.email}</span>
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <Radio className="w-12 h-12 text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-cyan-400/30 animate-pulse" />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                TechVibe
              </h1>
            </div>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Votre briefing quotidien sur l&apos;actu tech front-end et IA, généré à la demande
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-cyan-500/20 bg-gray-900/50 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  Générer un nouveau podcast
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Cliquez pour créer un briefing audio personnalisé basé sur les dernières actualités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generatePodcast}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:shadow-cyan-500/70 hover:scale-[1.02]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Radio className="mr-2 h-5 w-5" />
                      Générer le briefing du jour
                    </>
                  )}
                </Button>

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                  </div>
                )}

                {isGenerating && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-cyan-400">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <span className="text-sm">Récupération des flux RSS...</span>
                    </div>
                    <div className="flex items-center gap-3 text-cyan-400">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-100" />
                      <span className="text-sm">Génération du script avec l&apos;IA...</span>
                    </div>
                    <div className="flex items-center gap-3 text-cyan-400">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-200" />
                      <span className="text-sm">Synthèse vocale en cours...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {currentPodcast && currentPodcast.status === 'ready' && (
              <div className="space-y-6">
                <Card className="border-cyan-500/20 bg-gray-900/50 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>{currentPodcast.title}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-400 font-normal">
                        <Calendar className="w-4 h-4" />
                        {new Date(currentPodcast.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </CardTitle>
                    {currentPodcast.duration && (
                      <CardDescription className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        Durée estimée: {Math.ceil(currentPodcast.duration / 60)} minutes
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <PodcastPlayer audioUrl={currentPodcast.audio_url!} />

                    {currentPodcast.sources && currentPodcast.sources.length > 0 && (
                      <SourcesList sources={currentPodcast.sources} />
                    )}

                    {currentPodcast.script && (
                      <details className="group">
                        <summary className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2">
                          <span>Voir le script complet</span>
                          <ExternalLink className="w-4 h-4" />
                        </summary>
                        <div className="mt-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700 text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                          {currentPodcast.script}
                        </div>
                      </details>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {recentPodcasts.length > 1 && (
              <Card className="border-cyan-500/20 bg-gray-900/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Podcasts récents</CardTitle>
                  <CardDescription className="text-gray-400">
                    Vos derniers briefings générés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentPodcasts.slice(0, 5).map((podcast) => (
                      <button
                        key={podcast.id}
                        onClick={() => selectPodcast(podcast)}
                        disabled={podcast.status !== 'ready'}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                          currentPodcast?.id === podcast.id
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700 bg-gray-800/30 hover:border-cyan-500/50 hover:bg-gray-800/50'
                        } ${podcast.status !== 'ready' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-white">{podcast.title}</div>
                            <div className="text-sm text-gray-400 mt-1">
                              {new Date(podcast.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          {podcast.status === 'ready' && (
                            <Radio className="w-5 h-5 text-cyan-400" />
                          )}
                          {podcast.status === 'generating' && (
                            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <footer className="mt-16 text-center text-gray-500 text-sm">
            <p>Propulsé par Gemini AI et Google Text-to-Speech</p>
            <p className="mt-2">Sources: Hacker News, React Status, TypeScript Weekly, TLDR AI</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
