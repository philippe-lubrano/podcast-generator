# Configuration de TechVibe Podcast

## Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre `Project URL` et `anon public key`

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

### 3. Obtenir les clés API Google

#### Google Gemini API

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez une clé API
3. Copiez la clé pour la configuration Supabase

#### Google Cloud Text-to-Speech API

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Activez l'API Cloud Text-to-Speech
4. Créez des identifiants (API Key)
5. Copiez la clé API

### 4. Configurer les secrets dans Supabase

Dans votre projet Supabase, allez dans **Settings > Edge Functions** et ajoutez ces secrets :

```bash
# Via la CLI Supabase (recommandé)
supabase secrets set GEMINI_API_KEY=votre_cle_gemini
supabase secrets set GOOGLE_CLOUD_API_KEY=votre_cle_google_cloud

# Ou via le dashboard Supabase
# Settings > Edge Functions > Add secret
```

**Important** : Ces secrets sont automatiquement configurés et disponibles dans les edge functions. Vous n'avez pas besoin de les ajouter dans votre fichier `.env.local`.

### 5. Migrations de la base de données

Les migrations ont déjà été appliquées automatiquement :
- Table `podcasts` créée avec RLS activé
- Bucket `podcasts` créé dans Supabase Storage
- Policies configurées pour l'accès public

### 6. Déployer l'edge function

L'edge function `generate-podcast` a été déployée automatiquement.

Pour la redéployer manuellement si nécessaire :

```bash
supabase functions deploy generate-podcast
```

## Vérification de la configuration

Pour vérifier que tout fonctionne :

1. Lancez l'application en dev :
```bash
npm run dev
```

2. Ouvrez http://localhost:3000

3. Cliquez sur "Générer le briefing du jour"

4. Si tout est configuré correctement, vous devriez voir :
   - Les étapes de génération s'afficher
   - Un podcast audio généré après 30-60 secondes
   - Un lecteur audio fonctionnel
   - La liste des sources utilisées

## Dépannage

### Erreur "API keys not configured"

Vérifiez que vous avez bien configuré les secrets dans Supabase :
```bash
supabase secrets list
```

Vous devriez voir `GEMINI_API_KEY` et `GOOGLE_CLOUD_API_KEY`.

### Erreur "Failed to generate script"

- Vérifiez que votre clé Gemini est valide
- Assurez-vous d'avoir activé l'API Gemini dans votre compte Google

### Erreur "Failed to generate audio"

- Vérifiez que votre clé Google Cloud est valide
- Assurez-vous d'avoir activé l'API Cloud Text-to-Speech
- Vérifiez que votre compte Google Cloud a un mode de facturation activé

### Erreur de stockage

- Vérifiez que le bucket `podcasts` existe dans Supabase Storage
- Vérifiez que les policies de storage sont correctement configurées

## Coûts estimés

### Google Gemini
- Gratuit jusqu'à 60 requêtes/minute
- Chaque podcast = 1 requête

### Google Cloud TTS
- 0-1 million de caractères/mois : Gratuit
- Au-delà : ~$4 par million de caractères
- Un podcast de 5 minutes ≈ 1000 caractères

### Supabase
- Plan gratuit : 500 MB de stockage, 1 GB de bande passante
- Largement suffisant pour commencer

## Déploiement en production

Pour déployer sur Vercel ou Netlify :

1. Connectez votre repository Git
2. Ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Déployez !

Les secrets API restent dans Supabase et ne sont jamais exposés au client.
