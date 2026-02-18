# TechVibe Podcast

Une application Next.js permettant de générer des mini-podcasts audio à la demande sur l'actualité tech front-end et IA.

## Fonctionnalités

- **Génération automatique de podcasts** : Cliquez sur un bouton pour générer un briefing audio personnalisé
- **Agrégation de sources RSS** : Récupère les derniers articles de Hacker News, React Status, TypeScript Weekly et TLDR AI
- **IA pour la synthèse** : Utilise Google Gemini pour créer un script de podcast dynamique et engageant
- **Synthèse vocale** : Convertit le script en audio avec Google Text-to-Speech (voix française naturelle)
- **Interface élégante** : Design dark mode avec accents néon bleus
- **Historique** : Consultez vos podcasts précédents
- **Sources transparentes** : Liste complète des articles utilisés pour chaque podcast

## Technologies utilisées

- **Frontend** : Next.js 13, React, TypeScript, Tailwind CSS
- **Backend** : Supabase (base de données, stockage, edge functions)
- **IA** : Google Gemini pour la génération de scripts
- **TTS** : Google Text-to-Speech pour la synthèse vocale
- **UI** : shadcn/ui components

## Prérequis

- Node.js 18+
- Compte Supabase
- Clé API Google Cloud (avec Gemini et Text-to-Speech activés)

## Configuration

1. Clonez le repository

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env.local` avec vos variables d'environnement :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

4. Configurez les secrets Supabase pour l'edge function :
   - `GEMINI_API_KEY` : Votre clé API Google Gemini
   - `GOOGLE_CLOUD_API_KEY` : Votre clé API Google Cloud pour TTS

## Base de données

La base de données Supabase contient :
- Table `podcasts` : Stocke les podcasts générés avec leur script, URL audio, sources et statut
- Bucket `podcasts` : Stocke les fichiers audio MP3 générés
- Policies RLS : Accès public pour la lecture et la création

## Edge Functions

L'edge function `generate-podcast` :
1. Récupère les flux RSS des sources tech
2. Génère un script de podcast avec Gemini
3. Convertit le script en audio avec Google TTS
4. Stocke l'audio dans Supabase Storage
5. Met à jour la base de données avec les détails du podcast

## Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Build de production

```bash
npm run build
npm start
```

## Structure du projet

```
├── app/
│   ├── page.tsx          # Page principale
│   ├── layout.tsx        # Layout de l'application
│   └── globals.css       # Styles globaux
├── components/
│   ├── podcast-player.tsx    # Lecteur audio personnalisé
│   ├── sources-list.tsx      # Liste des sources
│   └── ui/                   # Composants UI shadcn
├── lib/
│   └── supabase.ts       # Client Supabase et types
└── supabase/
    └── functions/
        └── generate-podcast/
            └── index.ts  # Edge function de génération

```

## Utilisation

1. Cliquez sur "Générer le briefing du jour"
2. Attendez quelques instants pendant la génération (30-60 secondes)
3. Écoutez votre podcast avec le lecteur intégré
4. Consultez les sources utilisées
5. Accédez à vos podcasts précédents dans l'historique

## Personnalisation

- Modifiez les sources RSS dans `supabase/functions/generate-podcast/index.ts`
- Ajustez le prompt Gemini pour changer le style du podcast
- Changez la voix TTS en modifiant les paramètres dans la fonction edge

## Licence

MIT
