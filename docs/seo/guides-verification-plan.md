# Plan de vérification réelle — guides en anglais (phase 5B)

> Aucune page n'est publiée. Ce plan liste tout ce qui doit être **confirmé par l'équipe** ou **testé sur un appareil réel**
> avant publication. Chaque ligne reçoit : résultat, libellé exact constaté, modèle, version du système, date, testeur.

## 1. Applications à confirmer (bloquant)

Pour chaque plateforme, l'équipe doit fournir **par écrit** :

1. Le **nom exact** de l'application à installer et son **éditeur** (tel qu'affiché dans la boutique officielle).
2. Sa **disponibilité** dans la boutique officielle des pays visés : US, CA, UK, FR, BE, CH.
3. Son **coût** éventuel pour le client (application gratuite, achat intégré, abonnement de l'application elle-même) : à indiquer dans le guide si payant.
4. La **méthode de connexion** que le client saisit (identifiant + mot de passe, code, adresse) — sans exposer de détail technique interne.
5. Les fonctions réellement disponibles **dans cette application** (guide TV, replay) — liées au tableau des allégations A7/A8.

| Plateforme | Boutique officielle | Nom de l'application | Éditeur | Pays disponibles | Coût client | Confirmé par / date |
|---|---|---|---|---|---|---|
| Smart TV (Samsung, LG) | Samsung Apps / LG Content Store (LG Apps) |  |  |  |  |  |
| Android TV & Google TV | Google Play (TV) |  |  |  |  |  |
| Fire TV | Amazon Appstore |  |  |  |  |  |
| Apple TV | App Store (tvOS) |  |  |  |  |  |
| iPhone & iPad | App Store (iOS/iPadOS) |  |  |  |  |  |
| Android phones & tablets | Google Play |  |  |  |  |  |
| Computer (Windows, Mac) | Navigateur ou application (source officielle à préciser) |  |  |  |  |  |

## 2. Étapes et réponses à tester sur appareil

Chaque élément ci-dessous dépend de libellés de menus ou de comportements de la plateforme (faits tiers susceptibles de changer).

| ID | Guide | Élément | Ce qu'il faut vérifier | Résultat / libellé constaté |
|---|---|---|---|---|
| ST-1 | Smart TV (Samsung, LG) | Étape 1 : Check the connection | Open the TV Settings, then Network, and check that the TV is connected to the internet (cable or Wi-Fi). |  |
| ST-2 | Smart TV (Samsung, LG) | Étape 2 : Update the TV | In Settings, open Support (or "About this TV") and run the software update if one is offered. An up-to-date TV avoids many app problems. |  |
| ST-3 | Smart TV (Samsung, LG) | Étape 3 : Open the app store | On Samsung, press Home and open "Apps". On LG, open the app store from the home screen ("LG Content Store" or "Apps", depending on the model). |  |
| ST-4 | Smart TV (Samsung, LG) | Étape 4 : Install the app we told you about | Search for the app name sent by our team, select it, then choose "Install". Add it to the home screen to find it easily. |  |
| AT-1 | Android TV & Google TV | Étape 1 : Check the connection and updates | In Settings, open Network & Internet to check the connection, then System to install available updates. |  |
| AT-2 | Android TV & Google TV | Étape 2 : Open Google Play | From the home screen, open Apps and then Google Play (or "Search for apps" on Google TV). |  |
| AT-3 | Android TV & Google TV | Étape 3 : Install the app we told you about | Search for the app sent by our team, then select "Install". |  |
| FT-1 | Fire TV | Étape 1 : Check the connection and updates | Open Settings, then Network to check the connection, then "My Fire TV" to look for updates. |  |
| FT-2 | Fire TV | Étape 2 : Search for the app | From the home screen, open Search (the magnifying glass) and type the app name sent by our team. |  |
| FT-3 | Fire TV | Étape 3 : Install it from the Amazon Appstore | Select the app, then "Download" or "Get". Only install apps from the Amazon Appstore. |  |
| FT-D1 | Fire TV | Dépannage : The stick gets hot or the picture drops | Use the original power adapter plugged into a wall socket rather than a TV USB port, and the HDMI extender supplied if the stick is right against the TV. |  |
| AP-1 | Apple TV | Étape 1 : Update the Apple TV | Open Settings, then System, then Software Updates, and install the latest version offered. |  |
| AP-2 | Apple TV | Étape 2 : Open the App Store | From the home screen, open the App Store, then the Search tab. |  |
| AP-3 | Apple TV | Étape 3 : Install the app we told you about | Type the app name sent by our team, then select "Get". |  |
| AP-4 | Apple TV | Étape 4 : Enter your access details | Open the app and enter the login details received on WhatsApp. You can use your iPhone keyboard to type faster. |  |
| AP-D3 | Apple TV | Dépannage : The sound is out of sync | In Settings, open Video and Audio to calibrate audio sync, then restart the channel. |  |
| IO-1 | iPhone & iPad | Étape 1 : Update the device | Open Settings, then General, then Software Update. |  |
| IO-2 | iPhone & iPad | Étape 2 : Install the app we told you about | Open the App Store, tap Search, type the app name sent by our team, then tap "Get". |  |
| AN-1 | Android phones & tablets | Étape 1 : Update the device | In Settings, open System (or Software update, depending on the brand) and install the updates offered. |  |
| AN-2 | Android phones & tablets | Étape 2 : Install the app we told you about | Open Google Play, search for the app sent by our team, then tap "Install". |  |
| PC-0 | Computer (Windows, Mac) | Méthode | Navigateur ou application ? Navigateurs pris en charge ? | |

## 3. Matrice d'appareils de test (minimum)

| Plateforme | Appareil(s) recommandé(s) pour le test | Version du système |
|---|---|---|
| Smart TV | 1 Samsung (Tizen) + 1 LG (webOS) de moins de 4 ans | à noter |
| Android TV / Google TV | 1 téléviseur ou boîtier Google TV | à noter |
| Fire TV | 1 Fire TV Stick récent | à noter |
| Apple TV | 1 Apple TV 4K | à noter |
| iPhone / iPad | 1 iPhone + 1 iPad à jour | à noter |
| Android | 1 smartphone Android à jour | à noter |
| Ordinateur | 1 PC Windows + 1 Mac, navigateur à jour | à noter |

## 4. Preuves à conserver (internes, non publiées)

- Fiche de test par plateforme : modèle, version, date, testeur, résultat de chaque ID ci-dessus.
- Captures d'écran **internes** uniquement (elles montrent des interfaces et marques tierces : ne pas les publier).
- Confirmation écrite de l'équipe pour le tableau du §1.

## 5. Critères de publication

- 100 % des ID du §2 vérifiés et le texte des guides corrigé selon les libellés constatés.
- §1 complet pour chaque plateforme publiée (une plateforme non confirmée n'est pas publiée).
- Validation écrite du propriétaire ; date « Last reviewed » = date de la dernière vérification.
