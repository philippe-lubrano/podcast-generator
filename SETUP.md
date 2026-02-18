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
supabase secrets set ALLOWED_EMAILS=email1@example.com,email2@example.com

# Ou via le dashboard Supabase
# Settings > Edge Functions > Add secret
```

**Important** : 
- Ces secrets sont automatiquement configurés et disponibles dans les edge functions
- Vous n'avez pas besoin de les ajouter dans votre fichier `.env.local`
- `ALLOWED_EMAILS` contient la liste des emails autorisés à générer des podcasts (séparés par des virgules)

### 5. Configurer l'authentification

1. Allez dans **Authentication > Providers** dans Supabase
2. Activez le provider **Email**
3. Configurez les paramètres de confirmation d'email selon vos besoins
4. Ajoutez vos URLs autorisées dans **Authentication > URL Configuration**

Pour plus de détails, consultez [AUTHENTICATION.md](./AUTHENTICATION.md).

### 6. Migrations de la base de données

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

## Premier utilisateur

1. Ajoutez votre email dans `ALLOWED_EMAILS` (voir étape 4)
2. Lancez l'application : `npm run dev`
3. Ouvrez http://localhost:3000
4. Vous serez redirigé vers `/login`
5. Créez un compte avec votre email autorisé
6. Vérifiez votre email si la confirmation est activée
7. Connectez-vous et générez votre premier podcast !

## Vérification de la configuration

Pour vérifier que tout fonctionne :

1. Lancez l'application en dev :
```bash
npm run dev
```

2. Ouvrez http://localhost:3000

3. Connectez-vous avec un compte autorisé

4. Cliquez sur "Générer le briefing du jour"

5. Si tout est configuré correctement, vous devriez voir :
   - Les étapes de génération s'afficher
   - Un podcast audio généré après 30-60 secondes
   - Un lecteur audio fonctionnel
   - La liste des sources utilisées

## Dépannage

### Erreur "Authentication requise"

Vérifiez que :
- Vous êtes bien connecté (vérifiez en haut à droite de la page)
- Votre session n'a pas expiré
- Les variables d'environnement Supabase sont correctement configurées

### Erreur "Accès non autorisé"

Votre email n'est pas dans la liste ALLOWED_EMAILS :
- Vérifiez que votre email est bien ajouté dans les secrets Supabase
- Pas d'espaces superflus dans ALLOWED_EMAILS
- Format correct : `email1@example.com,email2@example.com`

### Erreur "Configuration manquante"

La variable ALLOWED_EMAILS n'est pas configurée dans l'Edge Function :
```bash
supabase secrets set ALLOWED_EMAILS=votre@email.com
```

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
