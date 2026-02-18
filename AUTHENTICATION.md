# Guide de configuration de l'authentification Supabase

Ce guide vous aide à configurer le système d'authentification pour TechVibe Podcast.

## 📋 Prérequis

- Un projet Supabase actif
- Accès à la console Supabase
- Variables d'environnement Next.js configurées

## 🔧 Configuration Supabase

### 1. Activer l'authentification Email

1. Allez dans votre projet Supabase
2. Naviguez vers **Authentication** > **Providers**
3. Activez le provider **Email**
4. Configurez les paramètres :
   - **Confirm email** : Activé (recommandé pour la production)
   - **Secure email change** : Activé
   - **Email templates** : Personnalisez si nécessaire

### 2. Configurer les URL de redirection

1. Allez dans **Authentication** > **URL Configuration**
2. Ajoutez vos URLs autorisées :
   - Pour le développement : `http://localhost:3000`
   - Pour la production : `https://votre-domaine.com`

### 3. Configurer la liste blanche d'emails

La variable `ALLOWED_EMAILS` contrôle quels utilisateurs peuvent générer des podcasts.

#### Dans Supabase Edge Functions :

1. Allez dans **Edge Functions** > **generate-podcast**
2. Cliquez sur **Settings** ou **Secrets**
3. Ajoutez la variable d'environnement :
   - **Nom** : `ALLOWED_EMAILS`
   - **Valeur** : `email1@example.com,email2@example.com,email3@example.com`

**Format important :**
- Emails séparés par des virgules (`,`)
- Pas d'espaces (ou ils seront automatiquement supprimés)
- Les emails sont insensibles à la casse

**Exemple :**
```
user1@company.com,user2@company.com,admin@company.com
```

## 🌐 Configuration Next.js

### Variables d'environnement (.env.local)

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

**Où trouver ces valeurs :**
1. Allez dans **Settings** > **API** dans votre projet Supabase
2. Copiez **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copiez **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 👥 Gestion des utilisateurs

### Ajouter un nouvel utilisateur autorisé

1. L'utilisateur doit d'abord créer un compte via `/login`
2. Ajoutez son email à la variable `ALLOWED_EMAILS` dans Supabase
3. L'utilisateur peut maintenant générer des podcasts

### Révoquer l'accès d'un utilisateur

1. Retirez l'email de la variable `ALLOWED_EMAILS`
2. L'utilisateur ne pourra plus générer de podcasts (mais peut toujours se connecter)

### Voir tous les utilisateurs inscrits

1. Allez dans **Authentication** > **Users** dans Supabase
2. Vous verrez tous les comptes créés
3. Vous pouvez supprimer des utilisateurs si nécessaire

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais commiter `.env.local`** dans Git
2. **Utiliser des mots de passe forts** (minimum 6 caractères)
3. **Activer la confirmation par email** en production
4. **Surveiller les logs** dans Supabase pour détecter les tentatives d'accès non autorisées
5. **Mettre à jour régulièrement** la liste ALLOWED_EMAILS

### Politique de mot de passe

Par défaut, Supabase requiert :
- Minimum 6 caractères
- Vous pouvez configurer des exigences plus strictes dans **Authentication** > **Policies**

## 🚀 Déploiement

### Netlify

1. Allez dans les paramètres de votre site Netlify
2. **Site settings** > **Environment variables**
3. Ajoutez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Vercel

1. Allez dans les paramètres de votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez les mêmes variables qu'avec Netlify

### Edge Functions

Les Edge Functions Supabase ont déjà accès à :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Ajoutez manuellement `ALLOWED_EMAILS`, `GEMINI_API_KEY`, `GOOGLE_CLOUD_API_KEY`

## 🧪 Test de l'authentification

### Test local

1. Démarrez le serveur : `npm run dev`
2. Ouvrez `http://localhost:3000`
3. Vous devriez être redirigé vers `/login`
4. Créez un compte avec un email de la liste ALLOWED_EMAILS
5. Connectez-vous et vérifiez que vous pouvez générer un podcast

### Test de la liste blanche

1. Connectez-vous avec un email NON dans ALLOWED_EMAILS
2. Essayez de générer un podcast
3. Vous devriez voir une erreur : "Accès non autorisé"

## ❓ Dépannage

### "Authentication requise"
- Vérifiez que vous êtes bien connecté
- Essayez de vous déconnecter et reconnecter

### "Accès non autorisé"
- Vérifiez que votre email est dans ALLOWED_EMAILS
- Vérifiez qu'il n'y a pas d'espaces superflus
- Les emails sont sensibles à la casse dans certains cas

### "Configuration manquante"
- La variable ALLOWED_EMAILS n'est pas configurée dans l'Edge Function
- Ajoutez-la dans les secrets de l'Edge Function

### Problèmes de redirection
- Vérifiez que les URLs sont correctement configurées dans Supabase
- Vérifiez les variables d'environnement Next.js

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
