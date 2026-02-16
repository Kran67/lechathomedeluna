'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCookies } from 'next-client-cookies';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmojiData {
  emoji: string;
  name: string;
  keywords: string[];
}

interface EmojiCategory {
  id: string;
  label: string;
  icon: string;
  emojis: EmojiData[];
}

interface EmojiPickerProps {
  /** Reference to the textarea where the emoji will be inserted */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Called after the emoji is inserted (optional) */
  onEmojiInsert?: (emoji: string) => void;
  /** CSS class override */
  className?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EMOJI_DATA: EmojiCategory[] = [
  {
    id: 'smileys',
    label: 'Emojis et personnes',
    icon: '😀',
    emojis: [
      { emoji: '😀', name: 'visage souriant', keywords: ['heureux', 'sourire', 'joie'] },
      { emoji: '😃', name: 'visage souriant grands yeux', keywords: ['heureux', 'sourire'] },
      { emoji: '😄', name: 'visage souriant yeux souriants', keywords: ['heureux', 'joie'] },
      { emoji: '😁', name: 'visage rayonnant', keywords: ['sourire', 'heureux'] },
      { emoji: '😆', name: 'visage souriant les yeux fermés', keywords: ['rire', 'lol'] },
      { emoji: '😅', name: 'visage souriant sueur froide', keywords: ['nerveux', 'soulagement'] },
      { emoji: '🤣', name: 'visage roulant au sol de rire', keywords: ['rire', 'lol', 'drôle'] },
      { emoji: '😂', name: 'visage avec larmes de joie', keywords: ['rire', 'larmes', 'drôle'] },
      { emoji: '🙂', name: 'visage légèrement souriant', keywords: ['sourire', 'content'] },
      { emoji: '🙃', name: 'visage à l\'envers', keywords: ['bizarre', 'sarcasme'] },
      { emoji: '😉', name: 'visage qui cligne de l\'œil', keywords: ['clin d\'oeil', 'espiègle'] },
      { emoji: '😊', name: 'visage souriant yeux souriants', keywords: ['timide', 'heureux'] },
      { emoji: '😇', name: 'visage souriant auréole', keywords: ['ange', 'innocent'] },
      { emoji: '🥰', name: 'visage avec coeurs', keywords: ['amour', 'adorable'] },
      { emoji: '😍', name: 'visage souriant yeux en cœur', keywords: ['amour', 'yeux coeur'] },
      { emoji: '🤩', name: 'visage souriant étoiles', keywords: ['impressionné', 'star'] },
      { emoji: '😘', name: 'visage envoyant un baiser', keywords: ['bisou', 'amour'] },
      { emoji: '😗', name: 'visage faisant la bise', keywords: ['bisou'] },
      { emoji: '😚', name: 'visage faisant la bise yeux fermés', keywords: ['bisou', 'timide'] },
      { emoji: '😙', name: 'visage faisant la bise yeux souriants', keywords: ['bisou', 'heureux'] },
      { emoji: '🥲', name: 'visage souriant larme', keywords: ['émouvant', 'triste'] },
      { emoji: '😋', name: 'visage savourant la nourriture', keywords: ['délicieux', 'yum'] },
      { emoji: '😛', name: 'visage avec langue', keywords: ['langue', 'espiègle'] },
      { emoji: '😜', name: 'visage avec langue clin d\'oeil', keywords: ['espiègle', 'drôle'] },
      { emoji: '🤪', name: 'visage excentrique', keywords: ['fou', 'drôle'] },
      { emoji: '😝', name: 'visage avec langue yeux fermés', keywords: ['dégoût', 'espiègle'] },
      { emoji: '🤑', name: 'visage yeux en dollar', keywords: ['argent', 'riche'] },
      { emoji: '🤗', name: 'visage serrant dans les bras', keywords: ['câlin', 'amical'] },
      { emoji: '🤭', name: 'visage main sur la bouche', keywords: ['chut', 'oops'] },
      { emoji: '🤫', name: 'visage chut', keywords: ['silence', 'secret'] },
      { emoji: '🤔', name: 'visage pensif', keywords: ['penser', 'réflexion'] },
      { emoji: '🤐', name: 'visage bouche zippée', keywords: ['silence', 'secret'] },
      { emoji: '🤨', name: 'visage sourcil levé', keywords: ['sceptique', 'suspicion'] },
      { emoji: '😐', name: 'visage neutre', keywords: ['neutre', 'indifférent'] },
      { emoji: '😑', name: 'visage sans expression', keywords: ['ennui', 'neutre'] },
      { emoji: '😶', name: 'visage sans bouche', keywords: ['silencieux'] },
      { emoji: '😏', name: 'visage narquois', keywords: ['sournois', 'flirt'] },
      { emoji: '😒', name: 'visage mécontent', keywords: ['mécontent', 'pas impressionné'] },
      { emoji: '🙄', name: 'visage yeux au ciel', keywords: ['oeil au ciel', 'ennui'] },
      { emoji: '😬', name: 'visage grimace', keywords: ['gêne', 'nerveux'] },
      { emoji: '🤥', name: 'visage menteur', keywords: ['mensonge', 'pinocchio'] },
      { emoji: '😌', name: 'visage soulagé', keywords: ['soulagement', 'paix'] },
      { emoji: '😔', name: 'visage pensif triste', keywords: ['triste', 'déçu'] },
      { emoji: '😪', name: 'visage somnolent', keywords: ['fatigué', 'sommeil'] },
      { emoji: '🤤', name: 'visage baveux', keywords: ['bave', 'envie'] },
      { emoji: '😴', name: 'visage endormi', keywords: ['dormir', 'zzz'] },
      { emoji: '😷', name: 'visage masque médical', keywords: ['malade', 'masque'] },
      { emoji: '🤒', name: 'visage thermomètre', keywords: ['malade', 'fièvre'] },
      { emoji: '🤕', name: 'visage bandage tête', keywords: ['blessé', 'douleur'] },
      { emoji: '🤢', name: 'visage nauséeux', keywords: ['malade', 'dégout'] },
      { emoji: '🤮', name: 'visage vomissant', keywords: ['vomir', 'malade'] },
      { emoji: '🤧', name: 'visage éternuant', keywords: ['éternuement', 'rhume'] },
      { emoji: '🥵', name: 'visage chaud', keywords: ['chaud', 'sueur'] },
      { emoji: '🥶', name: 'visage froid', keywords: ['froid', 'glaçon'] },
      { emoji: '🥴', name: 'visage dans les vapes', keywords: ['étourdi', 'soul'] },
      { emoji: '😵', name: 'visage étourdi yeux spirales', keywords: ['étourdi', 'fou'] },
      { emoji: '🤯', name: 'visage explosion tête', keywords: ['choqué', 'esprit soufflé'] },
      { emoji: '🤠', name: 'visage chapeau de cow-boy', keywords: ['cowboy', 'ouest'] },
      { emoji: '🥳', name: 'visage fête', keywords: ['fête', 'anniversaire'] },
      { emoji: '🥸', name: 'visage déguisé', keywords: ['déguisement', 'incognito'] },
      { emoji: '😎', name: 'visage lunettes de soleil', keywords: ['cool', 'lunettes'] },
      { emoji: '🤓', name: 'visage geek', keywords: ['geek', 'intellos'] },
      { emoji: '🧐', name: 'visage monocle', keywords: ['monocle', 'curieux'] },
      { emoji: '😕', name: 'visage confus', keywords: ['confus', 'déçu'] },
      { emoji: '😟', name: 'visage inquiet', keywords: ['inquiet', 'soucieux'] },
      { emoji: '🙁', name: 'visage légèrement fronçant les sourcils', keywords: ['triste', 'déçu'] },
      { emoji: '☹️', name: 'visage renfrogné', keywords: ['triste', 'malheureux'] },
      { emoji: '😮', name: 'visage bouche ouverte', keywords: ['surpris', 'wow'] },
      { emoji: '😯', name: 'visage stupéfait', keywords: ['surpris', 'choqué'] },
      { emoji: '😲', name: 'visage stupéfait yeux écarquillés', keywords: ['choqué', 'surpris'] },
      { emoji: '😳', name: 'visage rougi', keywords: ['gêné', 'choqué'] },
      { emoji: '🥺', name: 'visage suppliant', keywords: ['suppliant', 'triste'] },
      { emoji: '😦', name: 'visage fronçant les sourcils bouche ouverte', keywords: ['inquiet', 'surpris'] },
      { emoji: '😧', name: 'visage angoissé', keywords: ['angoisse', 'peur'] },
      { emoji: '😨', name: 'visage effrayé', keywords: ['peur', 'effrayé'] },
      { emoji: '😰', name: 'visage angoissé sueur froide', keywords: ['anxieux', 'peur'] },
      { emoji: '😥', name: 'visage déçu mais soulagé', keywords: ['déçu', 'soulagement'] },
      { emoji: '😢', name: 'visage pleurant', keywords: ['pleurer', 'triste'] },
      { emoji: '😭', name: 'visage pleurant fort', keywords: ['pleurer', 'sanglots'] },
      { emoji: '😱', name: 'visage criant de peur', keywords: ['terreur', 'cri', 'peur'] },
      { emoji: '😖', name: 'visage confondu', keywords: ['frustré', 'stressé'] },
      { emoji: '😣', name: 'visage persévérant', keywords: ['douleur', 'effort'] },
      { emoji: '😞', name: 'visage déçu', keywords: ['déçu', 'triste'] },
      { emoji: '😓', name: 'visage sueur froide', keywords: ['sueur', 'travail'] },
      { emoji: '😩', name: 'visage las', keywords: ['épuisé', 'frustré'] },
      { emoji: '😫', name: 'visage fatigué', keywords: ['fatigué', 'épuisé'] },
      { emoji: '🥱', name: 'bâillement', keywords: ['ennui', 'fatigué'] },
      { emoji: '😤', name: 'visage vapeur de nez', keywords: ['triomphant', 'en colère'] },
      { emoji: '😡', name: 'visage renfrogné rouge', keywords: ['colère', 'furieux'] },
      { emoji: '😠', name: 'visage en colère', keywords: ['colère', 'fâché'] },
      { emoji: '🤬', name: 'visage symboles sur la bouche', keywords: ['jurons', 'furieux'] },
      { emoji: '😈', name: 'visage souriant avec cornes', keywords: ['diable', 'méchant'] },
      { emoji: '👿', name: 'visage renfrogné avec cornes', keywords: ['démon', 'mal'] },
      { emoji: '💀', name: 'crâne', keywords: ['mort', 'danger'] },
      { emoji: '☠️', name: 'crâne et os croisés', keywords: ['poison', 'mort'] },
      { emoji: '💩', name: 'tas de caca', keywords: ['poop', 'caca'] },
      { emoji: '🤡', name: 'visage de clown', keywords: ['clown', 'drôle'] },
      { emoji: '👹', name: 'ogre', keywords: ['monstre', 'démon'] },
      { emoji: '👺', name: 'gobelin', keywords: ['monstre', 'rouge'] },
      { emoji: '👻', name: 'fantôme', keywords: ['fantôme', 'halloween'] },
      { emoji: '👾', name: 'alien monstre', keywords: ['jeu vidéo', 'extraterrestre'] },
      { emoji: '🤖', name: 'robot', keywords: ['robot', 'machine'] },
      { emoji: '👋', name: 'main agitée', keywords: ['salut', 'au revoir'] },
      { emoji: '🤚', name: 'dos de la main levée', keywords: ['stop', 'main'] },
      { emoji: '🖐️', name: 'main avec doigts écartés', keywords: ['main', 'cinq'] },
      { emoji: '✋', name: 'main levée', keywords: ['stop', 'cinq'] },
      { emoji: '🤙', name: 'appelle-moi', keywords: ['téléphone', 'shaka'] },
      { emoji: '👍', name: 'pouce en l\'air', keywords: ['bien', 'ok', 'approuvé'] },
      { emoji: '👎', name: 'pouce en bas', keywords: ['non', 'mauvais'] },
      { emoji: '👏', name: 'mains qui applaudissent', keywords: ['applaudissements', 'bravo'] },
      { emoji: '🙌', name: 'mains levées', keywords: ['célébration', 'hourra'] },
      { emoji: '🤝', name: 'poignée de main', keywords: ['accord', 'salut'] },
      { emoji: '💪', name: 'bras musclé', keywords: ['fort', 'muscle'] },
      { emoji: '🦾', name: 'bras mécanique', keywords: ['robot', 'force'] },
      { emoji: '🙏', name: 'mains jointes', keywords: ['prière', 'merci', 's\'il vous plaît'] },
      { emoji: '❤️', name: 'cœur rouge', keywords: ['amour', 'coeur'] },
      { emoji: '🧡', name: 'cœur orange', keywords: ['amour', 'coeur orange'] },
      { emoji: '💛', name: 'cœur jaune', keywords: ['amour', 'coeur jaune'] },
      { emoji: '💚', name: 'cœur vert', keywords: ['amour', 'coeur vert'] },
      { emoji: '💙', name: 'cœur bleu', keywords: ['amour', 'coeur bleu'] },
      { emoji: '💜', name: 'cœur violet', keywords: ['amour', 'coeur violet'] },
      { emoji: '🖤', name: 'cœur noir', keywords: ['amour', 'coeur noir'] },
      { emoji: '🤍', name: 'cœur blanc', keywords: ['amour', 'coeur blanc'] },
      { emoji: '💔', name: 'cœur brisé', keywords: ['rupture', 'triste'] },
      { emoji: '💕', name: 'deux cœurs', keywords: ['amour', 'affection'] },
      { emoji: '💞', name: 'cœurs tourbillonnants', keywords: ['amour', 'romance'] },
      { emoji: '💓', name: 'cœur battant', keywords: ['amour', 'palpitations'] },
      { emoji: '💗', name: 'cœur grandissant', keywords: ['amour', 'croissance'] },
      { emoji: '💖', name: 'cœur scintillant', keywords: ['amour', 'étincelles'] },
      { emoji: '💘', name: 'cœur avec flèche', keywords: ['cupidon', 'amour'] },
      { emoji: '💝', name: 'cœur avec ruban', keywords: ['cadeau', 'amour'] },
    ],
  },
  {
    id: 'animals',
    label: 'Animaux et nature',
    icon: '🐶',
    emojis: [
      { emoji: '🐶', name: 'tête de chien', keywords: ['chien', 'animal'] },
      { emoji: '🐱', name: 'tête de chat', keywords: ['chat', 'animal'] },
      { emoji: '🐭', name: 'tête de souris', keywords: ['souris', 'animal'] },
      { emoji: '🐹', name: 'hamster', keywords: ['hamster', 'animal'] },
      { emoji: '🐰', name: 'tête de lapin', keywords: ['lapin', 'animal'] },
      { emoji: '🦊', name: 'renard', keywords: ['renard', 'animal'] },
      { emoji: '🐻', name: 'tête d\'ours', keywords: ['ours', 'animal'] },
      { emoji: '🐼', name: 'panda', keywords: ['panda', 'animal'] },
      { emoji: '🐨', name: 'koala', keywords: ['koala', 'animal'] },
      { emoji: '🐯', name: 'tigre', keywords: ['tigre', 'animal'] },
      { emoji: '🦁', name: 'lion', keywords: ['lion', 'roi'] },
      { emoji: '🐮', name: 'vache', keywords: ['vache', 'animal'] },
      { emoji: '🐷', name: 'cochon', keywords: ['cochon', 'animal'] },
      { emoji: '🐸', name: 'grenouille', keywords: ['grenouille', 'animal'] },
      { emoji: '🐵', name: 'singe', keywords: ['singe', 'animal'] },
      { emoji: '🙈', name: 'singe ne voit pas le mal', keywords: ['singe', 'mal'] },
      { emoji: '🙉', name: 'singe n\'entend pas le mal', keywords: ['singe', 'mal'] },
      { emoji: '🙊', name: 'singe ne parle pas le mal', keywords: ['singe', 'mal'] },
      { emoji: '🐔', name: 'poulet', keywords: ['poulet', 'animal'] },
      { emoji: '🐧', name: 'pingouin', keywords: ['pingouin', 'animal'] },
      { emoji: '🐦', name: 'oiseau', keywords: ['oiseau', 'animal'] },
      { emoji: '🦆', name: 'canard', keywords: ['canard', 'animal'] },
      { emoji: '🦅', name: 'aigle', keywords: ['aigle', 'oiseau'] },
      { emoji: '🦉', name: 'hibou', keywords: ['hibou', 'animal'] },
      { emoji: '🦇', name: 'chauve-souris', keywords: ['chauve-souris', 'animal'] },
      { emoji: '🐺', name: 'loup', keywords: ['loup', 'animal'] },
      { emoji: '🐗', name: 'sanglier', keywords: ['sanglier', 'animal'] },
      { emoji: '🐴', name: 'cheval', keywords: ['cheval', 'animal'] },
      { emoji: '🦄', name: 'licorne', keywords: ['licorne', 'magique'] },
      { emoji: '🐝', name: 'abeille', keywords: ['abeille', 'insecte'] },
      { emoji: '🦋', name: 'papillon', keywords: ['papillon', 'insecte'] },
      { emoji: '🐛', name: 'chenille', keywords: ['chenille', 'insecte'] },
      { emoji: '🐌', name: 'escargot', keywords: ['escargot', 'lent'] },
      { emoji: '🐜', name: 'fourmi', keywords: ['fourmi', 'insecte'] },
      { emoji: '🦗', name: 'grillon', keywords: ['grillon', 'insecte'] },
      { emoji: '🕷️', name: 'araignée', keywords: ['araignée', 'insecte'] },
      { emoji: '🦂', name: 'scorpion', keywords: ['scorpion', 'animal'] },
      { emoji: '🐢', name: 'tortue', keywords: ['tortue', 'animal'] },
      { emoji: '🦎', name: 'lézard', keywords: ['lézard', 'reptile'] },
      { emoji: '🐍', name: 'serpent', keywords: ['serpent', 'reptile'] },
      { emoji: '🦖', name: 'T-Rex', keywords: ['dinosaure', 'animal'] },
      { emoji: '🦕', name: 'sauropode', keywords: ['dinosaure', 'animal'] },
      { emoji: '🐊', name: 'crocodile', keywords: ['crocodile', 'animal'] },
      { emoji: '🐳', name: 'baleine', keywords: ['baleine', 'océan'] },
      { emoji: '🐋', name: 'baleine', keywords: ['baleine', 'océan'] },
      { emoji: '🐬', name: 'dauphin', keywords: ['dauphin', 'océan'] },
      { emoji: '🦭', name: 'phoque', keywords: ['phoque', 'animal'] },
      { emoji: '🐟', name: 'poisson', keywords: ['poisson', 'mer'] },
      { emoji: '🐠', name: 'poisson tropicaux', keywords: ['poisson', 'tropical'] },
      { emoji: '🐡', name: 'poisson-globe', keywords: ['poisson', 'venimeux'] },
      { emoji: '🦈', name: 'requin', keywords: ['requin', 'danger'] },
      { emoji: '🐙', name: 'pieuvre', keywords: ['pieuvre', 'mer'] },
      { emoji: '🦑', name: 'calmar', keywords: ['calmar', 'mer'] },
      { emoji: '🦐', name: 'crevette', keywords: ['crevette', 'mer'] },
      { emoji: '🦞', name: 'homard', keywords: ['homard', 'mer'] },
      { emoji: '🦀', name: 'crabe', keywords: ['crabe', 'mer'] },
      { emoji: '🐡', name: 'poisson-globe', keywords: ['poisson', 'mer'] },
      { emoji: '🌸', name: 'fleur de cerisier', keywords: ['fleur', 'printemps'] },
      { emoji: '🌺', name: 'hibiscus', keywords: ['fleur', 'tropical'] },
      { emoji: '🌻', name: 'tournesol', keywords: ['tournesol', 'fleur'] },
      { emoji: '🌹', name: 'rose', keywords: ['rose', 'amour'] },
      { emoji: '🌷', name: 'tulipe', keywords: ['tulipe', 'fleur'] },
      { emoji: '🌱', name: 'plante en pot', keywords: ['plante', 'nature'] },
      { emoji: '🌿', name: 'herbe', keywords: ['herbe', 'nature'] },
      { emoji: '🍃', name: 'feuilles au vent', keywords: ['feuille', 'nature'] },
      { emoji: '🍀', name: 'trèfle à quatre feuilles', keywords: ['chance', 'chance'] },
      { emoji: '🌊', name: 'vague', keywords: ['vague', 'mer'] },
      { emoji: '🌈', name: 'arc-en-ciel', keywords: ['arc-en-ciel', 'couleur'] },
      { emoji: '⭐', name: 'étoile', keywords: ['étoile', 'ciel'] },
      { emoji: '🌙', name: 'croissant de lune', keywords: ['lune', 'nuit'] },
      { emoji: '☀️', name: 'soleil', keywords: ['soleil', 'jour'] },
      { emoji: '⛅', name: 'soleil derrière nuage', keywords: ['nuage', 'temps'] },
      { emoji: '🌧️', name: 'nuage avec pluie', keywords: ['pluie', 'temps'] },
      { emoji: '⛈️', name: 'nuage avec foudre', keywords: ['orage', 'temps'] },
      { emoji: '❄️', name: 'flocon de neige', keywords: ['neige', 'hiver'] },
      { emoji: '🌊', name: 'vague', keywords: ['vague', 'eau'] },
    ],
  },
  {
    id: 'food',
    label: 'Nourriture et boissons',
    icon: '🍕',
    emojis: [
      { emoji: '🍎', name: 'pomme rouge', keywords: ['pomme', 'fruit'] },
      { emoji: '🍊', name: 'mandarine', keywords: ['orange', 'fruit'] },
      { emoji: '🍋', name: 'citron', keywords: ['citron', 'fruit'] },
      { emoji: '🍇', name: 'raisin', keywords: ['raisin', 'fruit'] },
      { emoji: '🍓', name: 'fraise', keywords: ['fraise', 'fruit'] },
      { emoji: '🍒', name: 'cerise', keywords: ['cerise', 'fruit'] },
      { emoji: '🍑', name: 'pêche', keywords: ['pêche', 'fruit'] },
      { emoji: '🥭', name: 'mangue', keywords: ['mangue', 'fruit'] },
      { emoji: '🍍', name: 'ananas', keywords: ['ananas', 'fruit'] },
      { emoji: '🥥', name: 'noix de coco', keywords: ['coco', 'fruit'] },
      { emoji: '🥝', name: 'kiwi', keywords: ['kiwi', 'fruit'] },
      { emoji: '🍅', name: 'tomate', keywords: ['tomate', 'légume'] },
      { emoji: '🥑', name: 'avocat', keywords: ['avocat', 'fruit'] },
      { emoji: '🍆', name: 'aubergine', keywords: ['aubergine', 'légume'] },
      { emoji: '🥦', name: 'brocoli', keywords: ['brocoli', 'légume'] },
      { emoji: '🥕', name: 'carotte', keywords: ['carotte', 'légume'] },
      { emoji: '🌽', name: 'épi de maïs', keywords: ['maïs', 'légume'] },
      { emoji: '🍄', name: 'champignon', keywords: ['champignon', 'plante'] },
      { emoji: '🍕', name: 'pizza', keywords: ['pizza', 'nourriture'] },
      { emoji: '🍔', name: 'hamburger', keywords: ['burger', 'nourriture'] },
      { emoji: '🍟', name: 'frites', keywords: ['frites', 'nourriture'] },
      { emoji: '🌭', name: 'hot-dog', keywords: ['hot dog', 'nourriture'] },
      { emoji: '🥪', name: 'sandwich', keywords: ['sandwich', 'nourriture'] },
      { emoji: '🌮', name: 'taco', keywords: ['taco', 'mexicain'] },
      { emoji: '🌯', name: 'burrito', keywords: ['burrito', 'mexicain'] },
      { emoji: '🍜', name: 'bol de spaghetti', keywords: ['nouilles', 'ramen'] },
      { emoji: '🍣', name: 'sushi', keywords: ['sushi', 'japonais'] },
      { emoji: '🍱', name: 'boîte bento', keywords: ['bento', 'japonais'] },
      { emoji: '🍛', name: 'riz au curry', keywords: ['curry', 'indien'] },
      { emoji: '🍲', name: 'pot de nourriture', keywords: ['ragoût', 'soupe'] },
      { emoji: '🍦', name: 'glace molle', keywords: ['glace', 'dessert'] },
      { emoji: '🍧', name: 'sorbet', keywords: ['sorbet', 'dessert'] },
      { emoji: '🍨', name: 'crème glacée', keywords: ['glace', 'dessert'] },
      { emoji: '🍰', name: 'part de gâteau', keywords: ['gâteau', 'dessert'] },
      { emoji: '🎂', name: 'gâteau d\'anniversaire', keywords: ['anniversaire', 'gâteau'] },
      { emoji: '🍫', name: 'chocolat', keywords: ['chocolat', 'sucrerie'] },
      { emoji: '🍬', name: 'bonbon', keywords: ['bonbon', 'sucrerie'] },
      { emoji: '🍭', name: 'sucette', keywords: ['sucette', 'sucrerie'] },
      { emoji: '☕', name: 'café chaud', keywords: ['café', 'boisson'] },
      { emoji: '🍵', name: 'thé chaud', keywords: ['thé', 'boisson'] },
      { emoji: '🧃', name: 'boîte de jus', keywords: ['jus', 'boisson'] },
      { emoji: '🥤', name: 'verre avec paille', keywords: ['soda', 'boisson'] },
      { emoji: '🍺', name: 'chope de bière', keywords: ['bière', 'boisson'] },
      { emoji: '🍻', name: 'chopes de bière', keywords: ['bière', 'trinquer'] },
      { emoji: '🥂', name: 'coupes de champagne', keywords: ['champagne', 'célébration'] },
      { emoji: '🍷', name: 'verre de vin', keywords: ['vin', 'boisson'] },
      { emoji: '🍸', name: 'cocktail', keywords: ['cocktail', 'boisson'] },
      { emoji: '🍹', name: 'boisson tropicale', keywords: ['cocktail', 'tropical'] },
    ],
  },
  {
    id: 'activities',
    label: 'Activités',
    icon: '⚽',
    emojis: [
      { emoji: '⚽', name: 'ballon de football', keywords: ['football', 'sport'] },
      { emoji: '🏀', name: 'ballon de basketball', keywords: ['basket', 'sport'] },
      { emoji: '🏈', name: 'ballon de football américain', keywords: ['football américain', 'sport'] },
      { emoji: '⚾', name: 'balle de baseball', keywords: ['baseball', 'sport'] },
      { emoji: '🥎', name: 'balle de softball', keywords: ['softball', 'sport'] },
      { emoji: '🎾', name: 'balle de tennis', keywords: ['tennis', 'sport'] },
      { emoji: '🏐', name: 'ballon de volleyball', keywords: ['volley', 'sport'] },
      { emoji: '🏉', name: 'ballon de rugby', keywords: ['rugby', 'sport'] },
      { emoji: '🥏', name: 'frisbee', keywords: ['frisbee', 'sport'] },
      { emoji: '🎱', name: 'billard', keywords: ['billard', 'jeu'] },
      { emoji: '🏓', name: 'tennis de table', keywords: ['ping pong', 'sport'] },
      { emoji: '🏸', name: 'badminton', keywords: ['badminton', 'sport'] },
      { emoji: '🥊', name: 'gant de boxe', keywords: ['boxe', 'sport'] },
      { emoji: '🥋', name: 'uniforme d\'arts martiaux', keywords: ['karaté', 'sport'] },
      { emoji: '🎯', name: 'cible', keywords: ['cible', 'jeu'] },
      { emoji: '⛳', name: 'trou de golf avec drapeau', keywords: ['golf', 'sport'] },
      { emoji: '🏹', name: 'arc et flèche', keywords: ['tir à l\'arc', 'sport'] },
      { emoji: '🎣', name: 'canne à pêche', keywords: ['pêche', 'sport'] },
      { emoji: '🤿', name: 'masque de plongée', keywords: ['plongée', 'sport'] },
      { emoji: '🎽', name: 'chemise de sport', keywords: ['sport', 'vêtements'] },
      { emoji: '🎿', name: 'skis', keywords: ['ski', 'sport'] },
      { emoji: '🛷', name: 'luge', keywords: ['luge', 'hiver'] },
      { emoji: '🥌', name: 'pierre de curling', keywords: ['curling', 'sport'] },
      { emoji: '🏆', name: 'trophée', keywords: ['trophée', 'gagnant'] },
      { emoji: '🥇', name: 'médaille d\'or', keywords: ['or', 'médaille'] },
      { emoji: '🥈', name: 'médaille d\'argent', keywords: ['argent', 'médaille'] },
      { emoji: '🥉', name: 'médaille de bronze', keywords: ['bronze', 'médaille'] },
      { emoji: '🎖️', name: 'décoration militaire', keywords: ['médaille', 'honneur'] },
      { emoji: '🎪', name: 'chapiteau de cirque', keywords: ['cirque', 'spectacle'] },
      { emoji: '🎭', name: 'masques de théâtre', keywords: ['théâtre', 'art'] },
      { emoji: '🎨', name: 'palette d\'artiste', keywords: ['art', 'peinture'] },
      { emoji: '🎬', name: 'clap de cinéma', keywords: ['cinéma', 'film'] },
      { emoji: '🎤', name: 'microphone', keywords: ['musique', 'chant'] },
      { emoji: '🎧', name: 'casque audio', keywords: ['musique', 'audio'] },
      { emoji: '🎼', name: 'partition musicale', keywords: ['musique', 'mélodie'] },
      { emoji: '🎵', name: 'note de musique', keywords: ['musique', 'note'] },
      { emoji: '🎶', name: 'notes de musique', keywords: ['musique', 'notes'] },
      { emoji: '🎹', name: 'piano', keywords: ['piano', 'musique'] },
      { emoji: '🎸', name: 'guitare', keywords: ['guitare', 'musique'] },
      { emoji: '🥁', name: 'tambour', keywords: ['tambour', 'musique'] },
      { emoji: '🎲', name: 'dés', keywords: ['dés', 'jeu'] },
      { emoji: '♟️', name: 'pièce d\'échecs', keywords: ['échecs', 'jeu'] },
      { emoji: '🎯', name: 'cible', keywords: ['cible', 'précision'] },
      { emoji: '🎮', name: 'manette de jeu', keywords: ['jeu vidéo', 'gaming'] },
      { emoji: '🕹️', name: 'joystick', keywords: ['arcade', 'jeu vidéo'] },
    ],
  },
  {
    id: 'travel',
    label: 'Voyages et lieux',
    icon: '✈️',
    emojis: [
      { emoji: '🌍', name: 'globe europe-afrique', keywords: ['monde', 'terre'] },
      { emoji: '🌎', name: 'globe amériques', keywords: ['monde', 'terre'] },
      { emoji: '🌏', name: 'globe asie-australie', keywords: ['monde', 'terre'] },
      { emoji: '🗺️', name: 'carte du monde', keywords: ['carte', 'géographie'] },
      { emoji: '🧭', name: 'boussole', keywords: ['direction', 'navigation'] },
      { emoji: '🏔️', name: 'montagne enneigée', keywords: ['montagne', 'nature'] },
      { emoji: '⛰️', name: 'montagne', keywords: ['montagne', 'nature'] },
      { emoji: '🌋', name: 'volcan', keywords: ['volcan', 'éruption'] },
      { emoji: '🏕️', name: 'camping', keywords: ['camping', 'tente'] },
      { emoji: '🏖️', name: 'plage avec parasol', keywords: ['plage', 'vacances'] },
      { emoji: '🏜️', name: 'désert', keywords: ['désert', 'sable'] },
      { emoji: '🏝️', name: 'île déserte', keywords: ['île', 'tropical'] },
      { emoji: '🏞️', name: 'parc national', keywords: ['nature', 'forêt'] },
      { emoji: '🏟️', name: 'stade', keywords: ['stade', 'sport'] },
      { emoji: '🏛️', name: 'bâtiment classique', keywords: ['architecture', 'histoire'] },
      { emoji: '🏗️', name: 'construction', keywords: ['construction', 'bâtiment'] },
      { emoji: '🏘️', name: 'maisons', keywords: ['maisons', 'quartier'] },
      { emoji: '🏚️', name: 'maison abandonnée', keywords: ['ruine', 'abandonné'] },
      { emoji: '🏠', name: 'maison', keywords: ['maison', 'domicile'] },
      { emoji: '🏡', name: 'maison avec jardin', keywords: ['maison', 'jardin'] },
      { emoji: '🏢', name: 'immeuble de bureaux', keywords: ['bureau', 'travail'] },
      { emoji: '🏣', name: 'bureau de poste japonais', keywords: ['poste', 'japon'] },
      { emoji: '🏥', name: 'hôpital', keywords: ['hôpital', 'santé'] },
      { emoji: '🏦', name: 'banque', keywords: ['banque', 'argent'] },
      { emoji: '🏨', name: 'hôtel', keywords: ['hôtel', 'voyage'] },
      { emoji: '🏩', name: 'hôtel amoureux', keywords: ['hôtel', 'amour'] },
      { emoji: '🏪', name: 'magasin pratique', keywords: ['magasin', 'shopping'] },
      { emoji: '🏬', name: 'grand magasin', keywords: ['magasin', 'shopping'] },
      { emoji: '🏰', name: 'château européen', keywords: ['château', 'histoire'] },
      { emoji: '🏯', name: 'château japonais', keywords: ['château', 'japon'] },
      { emoji: '🗼', name: 'tour de Tokyo', keywords: ['tokyo', 'japon'] },
      { emoji: '🗽', name: 'statue de la liberté', keywords: ['liberté', 'USA'] },
      { emoji: '⛪', name: 'église', keywords: ['église', 'religion'] },
      { emoji: '🕌', name: 'mosquée', keywords: ['mosquée', 'islam'] },
      { emoji: '🕍', name: 'synagogue', keywords: ['synagogue', 'judaisme'] },
      { emoji: '⛩️', name: 'sanctuaire shinto', keywords: ['temple', 'japon'] },
      { emoji: '🌁', name: 'brouillard', keywords: ['brouillard', 'météo'] },
      { emoji: '🌃', name: 'nuit étoilée', keywords: ['nuit', 'étoiles'] },
      { emoji: '🏙️', name: 'paysage urbain', keywords: ['ville', 'urbain'] },
      { emoji: '🌄', name: 'lever de soleil sur montagnes', keywords: ['lever soleil', 'montagne'] },
      { emoji: '🌅', name: 'lever de soleil', keywords: ['lever soleil', 'matin'] },
      { emoji: '🌆', name: 'paysage urbain au coucher de soleil', keywords: ['coucher soleil', 'ville'] },
      { emoji: '🌇', name: 'coucher de soleil sur bâtiments', keywords: ['coucher soleil', 'bâtiment'] },
      { emoji: '🌉', name: 'pont la nuit', keywords: ['pont', 'nuit'] },
      { emoji: '🎠', name: 'manège', keywords: ['fête foraine', 'amusement'] },
      { emoji: '🎡', name: 'grande roue', keywords: ['grande roue', 'fête foraine'] },
      { emoji: '🎢', name: 'montagnes russes', keywords: ['montagnes russes', 'fête foraine'] },
      { emoji: '✈️', name: 'avion', keywords: ['avion', 'voyage', 'vol'] },
      { emoji: '🛫', name: 'avion au décollage', keywords: ['décollage', 'avion'] },
      { emoji: '🛬', name: 'avion à l\'atterrissage', keywords: ['atterrissage', 'avion'] },
      { emoji: '🚀', name: 'fusée', keywords: ['fusée', 'espace'] },
      { emoji: '🛸', name: 'soucoupe volante', keywords: ['OVNI', 'espace'] },
      { emoji: '🚂', name: 'locomotive', keywords: ['train', 'voyage'] },
      { emoji: '🚃', name: 'wagon', keywords: ['train', 'voyage'] },
      { emoji: '🚄', name: 'train grande vitesse', keywords: ['TGV', 'train'] },
      { emoji: '🚅', name: 'train balle', keywords: ['shinkansen', 'japon'] },
      { emoji: '🚆', name: 'train', keywords: ['train', 'voyage'] },
      { emoji: '🚇', name: 'métro', keywords: ['métro', 'transport'] },
      { emoji: '🚊', name: 'tramway', keywords: ['tram', 'transport'] },
      { emoji: '🚝', name: 'monorail', keywords: ['monorail', 'transport'] },
      { emoji: '🚞', name: 'chemin de fer de montagne', keywords: ['montagne', 'train'] },
      { emoji: '🚋', name: 'wagon de tramway', keywords: ['tram', 'transport'] },
      { emoji: '🚌', name: 'autobus', keywords: ['bus', 'transport'] },
      { emoji: '🚍', name: 'autobus arrivant', keywords: ['bus', 'transport'] },
      { emoji: '🚎', name: 'trolleybus', keywords: ['trolley', 'transport'] },
      { emoji: '🚐', name: 'minibus', keywords: ['minibus', 'transport'] },
      { emoji: '🚑', name: 'ambulance', keywords: ['ambulance', 'urgence'] },
      { emoji: '🚒', name: 'camion de pompiers', keywords: ['pompiers', 'urgence'] },
      { emoji: '🚓', name: 'voiture de police', keywords: ['police', 'sécurité'] },
      { emoji: '🚕', name: 'taxi', keywords: ['taxi', 'transport'] },
      { emoji: '🚗', name: 'automobile', keywords: ['voiture', 'transport'] },
      { emoji: '🚙', name: 'voiture de sport utilitaire', keywords: ['SUV', 'voiture'] },
      { emoji: '🛻', name: 'pick-up truck', keywords: ['camionnette', 'voiture'] },
      { emoji: '🚚', name: 'camion', keywords: ['camion', 'transport'] },
      { emoji: '🚛', name: 'camion articulé', keywords: ['camion', 'transport'] },
      { emoji: '🚜', name: 'tracteur', keywords: ['tracteur', 'agriculture'] },
      { emoji: '🏎️', name: 'voiture de course', keywords: ['course', 'sport'] },
      { emoji: '🏍️', name: 'moto', keywords: ['moto', 'transport'] },
      { emoji: '🛵', name: 'scooter', keywords: ['scooter', 'transport'] },
      { emoji: '🦽', name: 'fauteuil roulant manuel', keywords: ['fauteuil roulant', 'handicap'] },
      { emoji: '🛺', name: 'rickshaw', keywords: ['rickshaw', 'asie'] },
      { emoji: '🚲', name: 'vélo', keywords: ['vélo', 'transport'] },
      { emoji: '🛴', name: 'trottinette', keywords: ['trottinette', 'transport'] },
      { emoji: '🛹', name: 'skateboard', keywords: ['skateboard', 'sport'] },
      { emoji: '🛼', name: 'patins à roulettes', keywords: ['patins', 'sport'] },
      { emoji: '⛽', name: 'pompe à essence', keywords: ['essence', 'carburant'] },
      { emoji: '🚦', name: 'feu de circulation vertical', keywords: ['feu rouge', 'route'] },
      { emoji: '🗺️', name: 'carte du monde', keywords: ['carte', 'voyage'] },
    ],
  },
  {
    id: 'objects',
    label: 'Objets',
    icon: '💡',
    emojis: [
      { emoji: '⌚', name: 'montre', keywords: ['heure', 'temps'] },
      { emoji: '📱', name: 'téléphone mobile', keywords: ['téléphone', 'smartphone'] },
      { emoji: '💻', name: 'ordinateur portable', keywords: ['ordinateur', 'laptop'] },
      { emoji: '⌨️', name: 'clavier', keywords: ['clavier', 'ordinateur'] },
      { emoji: '🖥️', name: 'ordinateur de bureau', keywords: ['ordinateur', 'bureau'] },
      { emoji: '🖨️', name: 'imprimante', keywords: ['imprimante', 'bureau'] },
      { emoji: '🖱️', name: 'souris d\'ordinateur', keywords: ['souris', 'ordinateur'] },
      { emoji: '💾', name: 'disquette', keywords: ['disquette', 'sauvegarder'] },
      { emoji: '💿', name: 'CD optique', keywords: ['CD', 'musique'] },
      { emoji: '📀', name: 'DVD', keywords: ['DVD', 'vidéo'] },
      { emoji: '📷', name: 'appareil photo', keywords: ['photo', 'caméra'] },
      { emoji: '📸', name: 'appareil photo avec flash', keywords: ['photo', 'flash'] },
      { emoji: '📹', name: 'caméra vidéo', keywords: ['vidéo', 'caméra'] },
      { emoji: '📽️', name: 'projecteur cinéma', keywords: ['cinéma', 'film'] },
      { emoji: '📺', name: 'télévision', keywords: ['télé', 'TV'] },
      { emoji: '📻', name: 'radio', keywords: ['radio', 'son'] },
      { emoji: '📠', name: 'télécopieur', keywords: ['fax', 'bureau'] },
      { emoji: '☎️', name: 'téléphone', keywords: ['téléphone', 'appel'] },
      { emoji: '📟', name: 'bipeur', keywords: ['pager', 'communication'] },
      { emoji: '🔋', name: 'batterie', keywords: ['batterie', 'énergie'] },
      { emoji: '🔌', name: 'fiche électrique', keywords: ['prise', 'électricité'] },
      { emoji: '💡', name: 'ampoule', keywords: ['idée', 'lumière'] },
      { emoji: '🔦', name: 'lampe de poche', keywords: ['lampe', 'lumière'] },
      { emoji: '🕯️', name: 'bougie', keywords: ['bougie', 'lumière'] },
      { emoji: '🗑️', name: 'poubelle', keywords: ['poubelle', 'supprimer'] },
      { emoji: '🛢️', name: 'barril', keywords: ['barril', 'pétrole'] },
      { emoji: '💰', name: 'sac d\'argent', keywords: ['argent', 'richesse'] },
      { emoji: '💴', name: 'billet en yens', keywords: ['yen', 'argent'] },
      { emoji: '💵', name: 'billet en dollars', keywords: ['dollar', 'argent'] },
      { emoji: '💶', name: 'billet en euros', keywords: ['euro', 'argent'] },
      { emoji: '💷', name: 'billet en livres', keywords: ['livre sterling', 'argent'] },
      { emoji: '💸', name: 'billet d\'argent avec ailes', keywords: ['argent', 'dépenser'] },
      { emoji: '💳', name: 'carte de crédit', keywords: ['carte', 'paiement'] },
      { emoji: '🧾', name: 'reçu', keywords: ['reçu', 'achat'] },
      { emoji: '📧', name: 'e-mail', keywords: ['email', 'message'] },
      { emoji: '📨', name: 'enveloppe entrante', keywords: ['message', 'courrier'] },
      { emoji: '📩', name: 'enveloppe avec flèche vers le bas', keywords: ['télécharger', 'message'] },
      { emoji: '📪', name: 'boîte aux lettres fermée', keywords: ['courrier', 'boite'] },
      { emoji: '📫', name: 'boîte aux lettres fermée avec drapeau levé', keywords: ['courrier', 'message'] },
      { emoji: '📬', name: 'boîte aux lettres ouverte avec drapeau levé', keywords: ['courrier', 'message'] },
      { emoji: '📭', name: 'boîte aux lettres ouverte avec drapeau baissé', keywords: ['courrier', 'vide'] },
      { emoji: '📮', name: 'boîte aux lettres', keywords: ['courrier', 'poste'] },
      { emoji: '📝', name: 'mémo', keywords: ['note', 'écrire'] },
      { emoji: '📄', name: 'page tournée vers le haut', keywords: ['document', 'page'] },
      { emoji: '📃', name: 'page avec enroulement', keywords: ['document', 'page'] },
      { emoji: '📑', name: 'défilement de pages', keywords: ['document', 'fichiers'] },
      { emoji: '🗒️', name: 'bloc-notes en spirale', keywords: ['carnet', 'notes'] },
      { emoji: '📔', name: 'cahier avec couverture décorative', keywords: ['cahier', 'notes'] },
      { emoji: '📒', name: 'cahier', keywords: ['cahier', 'notes'] },
      { emoji: '📕', name: 'livre fermé', keywords: ['livre', 'lire'] },
      { emoji: '📗', name: 'livre vert', keywords: ['livre', 'lire'] },
      { emoji: '📘', name: 'livre bleu', keywords: ['livre', 'lire'] },
      { emoji: '📙', name: 'livre orange', keywords: ['livre', 'lire'] },
      { emoji: '📚', name: 'livres', keywords: ['bibliothèque', 'livres'] },
      { emoji: '🔑', name: 'clé', keywords: ['clé', 'sécurité'] },
      { emoji: '🗝️', name: 'ancienne clé', keywords: ['clé', 'ancienne'] },
      { emoji: '🔒', name: 'serrure verrouillée', keywords: ['verrou', 'sécurité'] },
      { emoji: '🔓', name: 'serrure déverrouillée', keywords: ['déverrouillé', 'ouvert'] },
      { emoji: '🔨', name: 'marteau', keywords: ['marteau', 'outil'] },
      { emoji: '⚒️', name: 'marteau et pioche', keywords: ['outil', 'travail'] },
      { emoji: '🛠️', name: 'marteau et clé', keywords: ['outil', 'réparation'] },
      { emoji: '⛏️', name: 'pioche', keywords: ['pioche', 'outil'] },
      { emoji: '🔧', name: 'clé à molette', keywords: ['clé', 'outil'] },
      { emoji: '🔩', name: 'vis', keywords: ['vis', 'outil'] },
      { emoji: '⚙️', name: 'engrenage', keywords: ['engrenage', 'paramètres'] },
      { emoji: '🗜️', name: 'presse', keywords: ['presse', 'outil'] },
      { emoji: '🔗', name: 'maillon de chaîne', keywords: ['lien', 'chaîne'] },
      { emoji: '⛓️', name: 'chaînes', keywords: ['chaîne', 'attaché'] },
      { emoji: '🧰', name: 'boîte à outils', keywords: ['outils', 'bricolage'] },
      { emoji: '🧲', name: 'aimant', keywords: ['aimant', 'magnétique'] },
      { emoji: '🔫', name: 'pistolet à eau', keywords: ['pistolet', 'jouet'] },
    ],
  },
  {
    id: 'symbols',
    label: 'Symboles',
    icon: '❤️',
    emojis: [
      { emoji: '❤️', name: 'cœur rouge', keywords: ['amour', 'coeur'] },
      { emoji: '🧡', name: 'cœur orange', keywords: ['amour', 'orange'] },
      { emoji: '💛', name: 'cœur jaune', keywords: ['amour', 'jaune'] },
      { emoji: '💚', name: 'cœur vert', keywords: ['amour', 'vert'] },
      { emoji: '💙', name: 'cœur bleu', keywords: ['amour', 'bleu'] },
      { emoji: '💜', name: 'cœur violet', keywords: ['amour', 'violet'] },
      { emoji: '🖤', name: 'cœur noir', keywords: ['amour', 'noir'] },
      { emoji: '🤍', name: 'cœur blanc', keywords: ['amour', 'blanc'] },
      { emoji: '🤎', name: 'cœur marron', keywords: ['amour', 'marron'] },
      { emoji: '💔', name: 'cœur brisé', keywords: ['rupture', 'triste'] },
      { emoji: '❣️', name: 'point d\'exclamation en cœur', keywords: ['amour', 'exclamation'] },
      { emoji: '💕', name: 'deux cœurs', keywords: ['amour', 'affection'] },
      { emoji: '💞', name: 'cœurs tourbillonnants', keywords: ['amour', 'romance'] },
      { emoji: '💓', name: 'cœur battant', keywords: ['amour', 'battement'] },
      { emoji: '💗', name: 'cœur grandissant', keywords: ['amour', 'croissance'] },
      { emoji: '💖', name: 'cœur scintillant', keywords: ['amour', 'étoiles'] },
      { emoji: '💝', name: 'cœur avec ruban', keywords: ['cadeau', 'amour'] },
      { emoji: '💘', name: 'cœur avec flèche', keywords: ['cupidon', 'amour'] },
      { emoji: '💟', name: 'décoration en cœur', keywords: ['amour', 'cœur'] },
      { emoji: '☮️', name: 'symbole de paix', keywords: ['paix', 'pacifisme'] },
      { emoji: '✝️', name: 'croix latine', keywords: ['religion', 'chrétien'] },
      { emoji: '☪️', name: 'croissant de lune et étoile', keywords: ['islam', 'religion'] },
      { emoji: '☯️', name: 'yin yang', keywords: ['équilibre', 'taoïsme'] },
      { emoji: '✡️', name: 'étoile de David', keywords: ['judaïsme', 'religion'] },
      { emoji: '🔯', name: 'étoile pointée à six branches', keywords: ['étoile', 'magie'] },
      { emoji: '🔱', name: 'emblème du trident', keywords: ['trident', 'Poseidon'] },
      { emoji: '⚜️', name: 'fleur de lys', keywords: ['fleur de lys', 'royauté'] },
      { emoji: '🔰', name: 'symbole des débutants japonais', keywords: ['débutant', 'Japon'] },
      { emoji: '♻️', name: 'symbole de recyclage', keywords: ['recycler', 'écologie'] },
      { emoji: '✅', name: 'bouton coché', keywords: ['ok', 'cocher'] },
      { emoji: '❎', name: 'bouton croix', keywords: ['non', 'croix'] },
      { emoji: '🔴', name: 'disque rouge', keywords: ['rouge', 'cercle'] },
      { emoji: '🟠', name: 'disque orange', keywords: ['orange', 'cercle'] },
      { emoji: '🟡', name: 'disque jaune', keywords: ['jaune', 'cercle'] },
      { emoji: '🟢', name: 'disque vert', keywords: ['vert', 'cercle'] },
      { emoji: '🔵', name: 'disque bleu', keywords: ['bleu', 'cercle'] },
      { emoji: '🟣', name: 'disque violet', keywords: ['violet', 'cercle'] },
      { emoji: '⚫', name: 'disque noir', keywords: ['noir', 'cercle'] },
      { emoji: '⚪', name: 'disque blanc', keywords: ['blanc', 'cercle'] },
      { emoji: '🟤', name: 'disque marron', keywords: ['marron', 'cercle'] },
      { emoji: '🔺', name: 'triangle rouge pointant vers le haut', keywords: ['triangle', 'rouge'] },
      { emoji: '🔻', name: 'triangle rouge pointant vers le bas', keywords: ['triangle', 'bas'] },
      { emoji: '💠', name: 'diamant avec point', keywords: ['diamant', 'bleu'] },
      { emoji: '🔷', name: 'grand diamant bleu', keywords: ['diamant', 'bleu'] },
      { emoji: '🔶', name: 'grand diamant orange', keywords: ['diamant', 'orange'] },
      { emoji: '▪️', name: 'petit carré noir', keywords: ['carré', 'noir'] },
      { emoji: '▫️', name: 'petit carré blanc', keywords: ['carré', 'blanc'] },
      { emoji: '◾', name: 'carré moyen noir', keywords: ['carré', 'noir'] },
      { emoji: '◽', name: 'carré moyen blanc', keywords: ['carré', 'blanc'] },
      { emoji: '◼️', name: 'grand carré noir', keywords: ['carré', 'noir'] },
      { emoji: '◻️', name: 'grand carré blanc', keywords: ['carré', 'blanc'] },
      { emoji: '⭕', name: 'anneau rouge', keywords: ['cercle', 'rouge'] },
      { emoji: '✖️', name: 'signe de multiplication', keywords: ['multiplication', 'croix'] },
      { emoji: '➕', name: 'signe plus lourd', keywords: ['addition', 'plus'] },
      { emoji: '➖', name: 'signe moins', keywords: ['soustraction', 'moins'] },
      { emoji: '➗', name: 'signe de division', keywords: ['division', 'diviser'] },
      { emoji: '❓', name: 'point d\'interrogation', keywords: ['question', 'aide'] },
      { emoji: '❔', name: 'point d\'interrogation blanc', keywords: ['question'] },
      { emoji: '❗', name: 'point d\'exclamation', keywords: ['exclamation', 'attention'] },
      { emoji: '❕', name: 'point d\'exclamation blanc', keywords: ['exclamation'] },
      { emoji: '🔅', name: 'bouton luminosité basse', keywords: ['luminosité', 'basse'] },
      { emoji: '🔆', name: 'bouton luminosité haute', keywords: ['luminosité', 'haute'] },
      { emoji: '💯', name: 'cent points', keywords: ['parfait', '100'] },
      { emoji: '🔔', name: 'cloche', keywords: ['notification', 'cloche'] },
      { emoji: '🔕', name: 'cloche barrée', keywords: ['silencieux', 'muet'] },
      { emoji: '🎵', name: 'note de musique', keywords: ['musique', 'note'] },
      { emoji: '🎶', name: 'notes de musique', keywords: ['musique', 'notes'] },
      { emoji: '⚠️', name: 'signe d\'avertissement', keywords: ['attention', 'danger'] },
      { emoji: '🚫', name: 'interdit', keywords: ['non', 'interdit'] },
      { emoji: '⛔', name: 'panneau d\'arrêt', keywords: ['stop', 'interdit'] },
      { emoji: '🚷', name: 'pas de piétons', keywords: ['interdit', 'piéton'] },
      { emoji: '📵', name: 'téléphones mobiles interdits', keywords: ['interdit', 'téléphone'] },
      { emoji: '🔞', name: 'pas de personnes moins de 18 ans', keywords: ['adulte', '18+'] },
      { emoji: '🆗', name: 'bouton OK', keywords: ['ok', 'correct'] },
      { emoji: '🆙', name: 'bouton UP', keywords: ['up', 'monte'] },
      { emoji: '🆕', name: 'bouton NEW', keywords: ['nouveau', 'new'] },
      { emoji: '🆓', name: 'bouton FREE', keywords: ['gratuit', 'free'] },
      { emoji: '🆒', name: 'bouton COOL', keywords: ['cool', 'super'] },
      { emoji: '🅰️', name: 'groupe sanguin A', keywords: ['A', 'lettre'] },
      { emoji: '🅱️', name: 'groupe sanguin B', keywords: ['B', 'lettre'] },
      { emoji: '🆎', name: 'bouton AB', keywords: ['AB', 'groupe sanguin'] },
      { emoji: '🅾️', name: 'groupe sanguin O', keywords: ['O', 'lettre'] },
    ],
  },
  {
    id: 'flags',
    label: 'Drapeaux',
    icon: '🏁',
    emojis: [
      { emoji: '🏁', name: 'drapeau à damiers', keywords: ['course', 'drapeau'] },
      { emoji: '🚩', name: 'drapeau triangulaire', keywords: ['drapeau', 'signal'] },
      { emoji: '🎌', name: 'drapeaux croisés', keywords: ['japon', 'drapeau'] },
      { emoji: '🏴', name: 'drapeau noir', keywords: ['pirate', 'noir'] },
      { emoji: '🏳️', name: 'drapeau blanc', keywords: ['paix', 'blanc'] },
      { emoji: '🏳️‍🌈', name: 'drapeau arc-en-ciel', keywords: ['arc-en-ciel', 'LGBT'] },
      { emoji: '🏳️‍⚧️', name: 'drapeau transgenre', keywords: ['transgenre', 'LGBT'] },
      { emoji: '🏴‍☠️', name: 'drapeau pirate', keywords: ['pirate', 'jolly roger'] },
      { emoji: '🇫🇷', name: 'drapeau français', keywords: ['france', 'drapeau'] },
      { emoji: '🇬🇧', name: 'drapeau britannique', keywords: ['royaume-uni', 'drapeau'] },
      { emoji: '🇺🇸', name: 'drapeau américain', keywords: ['états-unis', 'drapeau'] },
      { emoji: '🇩🇪', name: 'drapeau allemand', keywords: ['allemagne', 'drapeau'] },
      { emoji: '🇯🇵', name: 'drapeau japonais', keywords: ['japon', 'drapeau'] },
      { emoji: '🇨🇳', name: 'drapeau chinois', keywords: ['chine', 'drapeau'] },
      { emoji: '🇷🇺', name: 'drapeau russe', keywords: ['russie', 'drapeau'] },
      { emoji: '🇧🇷', name: 'drapeau brésilien', keywords: ['brésil', 'drapeau'] },
      { emoji: '🇮🇳', name: 'drapeau indien', keywords: ['inde', 'drapeau'] },
      { emoji: '🇨🇦', name: 'drapeau canadien', keywords: ['canada', 'drapeau'] },
      { emoji: '🇦🇺', name: 'drapeau australien', keywords: ['australie', 'drapeau'] },
      { emoji: '🇮🇹', name: 'drapeau italien', keywords: ['italie', 'drapeau'] },
      { emoji: '🇪🇸', name: 'drapeau espagnol', keywords: ['espagne', 'drapeau'] },
      { emoji: '🇲🇽', name: 'drapeau mexicain', keywords: ['mexique', 'drapeau'] },
      { emoji: '🇰🇷', name: 'drapeau coréen', keywords: ['corée', 'drapeau'] },
      { emoji: '🇿🇦', name: 'drapeau sud-africain', keywords: ['afrique du sud', 'drapeau'] },
      { emoji: '🇦🇷', name: 'drapeau argentin', keywords: ['argentine', 'drapeau'] },
      { emoji: '🇵🇹', name: 'drapeau portugais', keywords: ['portugal', 'drapeau'] },
      { emoji: '🇳🇱', name: 'drapeau néerlandais', keywords: ['pays-bas', 'drapeau'] },
      { emoji: '🇧🇪', name: 'drapeau belge', keywords: ['belgique', 'drapeau'] },
      { emoji: '🇨🇭', name: 'drapeau suisse', keywords: ['suisse', 'drapeau'] },
      { emoji: '🇦🇹', name: 'drapeau autrichien', keywords: ['autriche', 'drapeau'] },
      { emoji: '🇸🇪', name: 'drapeau suédois', keywords: ['suède', 'drapeau'] },
      { emoji: '🇳🇴', name: 'drapeau norvégien', keywords: ['norvège', 'drapeau'] },
      { emoji: '🇩🇰', name: 'drapeau danois', keywords: ['danemark', 'drapeau'] },
      { emoji: '🇫🇮', name: 'drapeau finlandais', keywords: ['finlande', 'drapeau'] },
      { emoji: '🇵🇱', name: 'drapeau polonais', keywords: ['pologne', 'drapeau'] },
      { emoji: '🇨🇿', name: 'drapeau tchèque', keywords: ['tchéquie', 'drapeau'] },
      { emoji: '🇭🇺', name: 'drapeau hongrois', keywords: ['hongrie', 'drapeau'] },
      { emoji: '🇬🇷', name: 'drapeau grec', keywords: ['grèce', 'drapeau'] },
      { emoji: '🇹🇷', name: 'drapeau turc', keywords: ['turquie', 'drapeau'] },
      { emoji: '🇸🇦', name: 'drapeau saoudien', keywords: ['arabie saoudite', 'drapeau'] },
      { emoji: '🇮🇱', name: 'drapeau israélien', keywords: ['israël', 'drapeau'] },
      { emoji: '🇪🇬', name: 'drapeau égyptien', keywords: ['égypte', 'drapeau'] },
      { emoji: '🇳🇬', name: 'drapeau nigérian', keywords: ['nigéria', 'drapeau'] },
      { emoji: '🇰🇪', name: 'drapeau kényan', keywords: ['kenya', 'drapeau'] },
      { emoji: '🇵🇭', name: 'drapeau philippin', keywords: ['philippines', 'drapeau'] },
      { emoji: '🇮🇩', name: 'drapeau indonésien', keywords: ['indonésie', 'drapeau'] },
      { emoji: '🇹🇭', name: 'drapeau thaïlandais', keywords: ['thaïlande', 'drapeau'] },
      { emoji: '🇻🇳', name: 'drapeau vietnamien', keywords: ['vietnam', 'drapeau'] },
      { emoji: '🇲🇦', name: 'drapeau marocain', keywords: ['maroc', 'drapeau'] },
      { emoji: '🇩🇿', name: 'drapeau algérien', keywords: ['algérie', 'drapeau'] },
      { emoji: '🇹🇳', name: 'drapeau tunisien', keywords: ['tunisie', 'drapeau'] },
    ],
  },
];

// ─── Recent emojis ────────────────────────────────────────────────────────────

/** Clé cookie : "emoji_recents_<userId>" */
const RECENT_COOKIE_PREFIX = 'emoji_recents_';
/** Clé cookie contenant l'id de l'utilisateur connecté */
const USER_ID_COOKIE_KEY = 'userId';
/** Nombre maximum d'emojis récents conservés */
const MAX_RECENTS = 32;

function buildRecentCookieKey(userId: string): string {
  return `${RECENT_COOKIE_PREFIX}${userId}`;
}

function parseRecentEmojis(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((e) => typeof e === 'string');
  } catch {
    // cookie corrompu → on ignore
  }
  return [];
}

/**
 * Ajoute un emoji en tête de liste, déduplique, et tronque à MAX_RECENTS.
 */
function addToRecents(current: string[], emoji: string): string[] {
  const filtered = current.filter((e) => e !== emoji);
  return [emoji, ...filtered].slice(0, MAX_RECENTS);
}

// ─── Virtual List Types ───────────────────────────────────────────────────────

interface VirtualRow {
  type: 'header' | 'emoji-row';
  categoryId: string;
  categoryLabel?: string;
  emojis?: EmojiData[];
  rowIndex?: number;
}

const EMOJIS_PER_ROW = 8;
const EMOJI_SIZE = 38;
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = EMOJI_SIZE + 4;

// ─── Utility ──────────────────────────────────────────────────────────────────

function insertEmojiIntoTextarea(
  textarea: HTMLTextAreaElement,
  emoji: string
): void {
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const text = textarea.value;
  const newText = text.slice(0, start) + emoji + text.slice(end);
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value'
  )?.set;
  nativeInputValueSetter?.call(textarea, newText);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  const newCursor = start + emoji.length;
  textarea.setSelectionRange(newCursor, newCursor);
  textarea.focus();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmojiPicker({
  textareaRef,
  onEmojiInsert,
  className = '',
}: EmojiPickerProps) {
  const cookies = useCookies();

  // ── Récupération de l'id utilisateur depuis le cookie ─────────────────────
  const userId = cookies.get(USER_ID_COOKIE_KEY) ?? '';

  // ── Récents : lecture initiale depuis le cookie ───────────────────────────
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    if (!userId) return [];
    return parseRecentEmojis(cookies.get(buildRecentCookieKey(userId)));
  });

  // ── Synchronisation cookie → state quand userId change ───────────────────
  useEffect(() => {
    if (!userId) {
      setRecentEmojis([]);
      return;
    }
    setRecentEmojis(parseRecentEmojis(cookies.get(buildRecentCookieKey(userId))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('recent');
  const [scrollTop, setScrollTop] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Catégorie "Récent" construite dynamiquement ───────────────────────────
  const recentCategory = useMemo<EmojiCategory | null>(() => {
    if (recentEmojis.length === 0) return null;

    // On enrichit chaque emoji récent avec ses métadonnées depuis EMOJI_DATA
    const allEmojis = EMOJI_DATA.flatMap((c) => c.emojis);
    const emojiMap = new Map<string, EmojiData>(allEmojis.map((e) => [e.emoji, e]));

    const emojis: EmojiData[] = recentEmojis.map(
      (e) =>
        emojiMap.get(e) ?? { emoji: e, name: e, keywords: [] }
    );

    return {
      id: 'recent',
      label: 'Récemment utilisés',
      icon: '🕐',
      emojis,
    };
  }, [recentEmojis]);

  // ── Jeu de catégories complet (récents en tête si disponible) ─────────────
  const allCategories = useMemo<EmojiCategory[]>(
    () => (recentCategory ? [recentCategory, ...EMOJI_DATA] : EMOJI_DATA),
    [recentCategory]
  );

  // ── Initialise l'onglet actif sur "recent" s'il existe, sinon premier cat ─
  useEffect(() => {
    setActiveCategory(recentCategory ? 'recent' : EMOJI_DATA[0].id);
  }, [recentCategory !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filtered data when searching ──────────────────────────────────────────
  const filteredCategories = useMemo<EmojiCategory[]>(() => {
    if (!searchQuery.trim()) return allCategories;
    const q = searchQuery.toLowerCase();
    const results: EmojiData[] = [];
    // On ne cherche que dans les catégories non-récents pour éviter les doublons
    for (const cat of EMOJI_DATA) {
      for (const emoji of cat.emojis) {
        if (
          emoji.name.toLowerCase().includes(q) ||
          emoji.keywords.some((k) => k.toLowerCase().includes(q)) ||
          emoji.emoji === q
        ) {
          results.push(emoji);
        }
      }
    }
    if (results.length === 0) return [];
    return [
      {
        id: 'search-results',
        label: `Résultats (${results.length})`,
        icon: '🔍',
        emojis: results,
      },
    ];
  }, [searchQuery, allCategories]);

  // ── Build virtual rows ────────────────────────────────────────────────────
  const virtualRows = useMemo<VirtualRow[]>(() => {
    const rows: VirtualRow[] = [];
    for (const cat of filteredCategories) {
      rows.push({ type: 'header', categoryId: cat.id, categoryLabel: cat.label });
      const chunks = [];
      for (let i = 0; i < cat.emojis.length; i += EMOJIS_PER_ROW) {
        chunks.push(cat.emojis.slice(i, i + EMOJIS_PER_ROW));
      }
      chunks.forEach((chunk, idx) => {
        rows.push({ type: 'emoji-row', categoryId: cat.id, emojis: chunk, rowIndex: idx });
      });
    }
    return rows;
  }, [filteredCategories]);

  // ── Row offsets ───────────────────────────────────────────────────────────
  const rowOffsets = useMemo(() => {
    const offsets: number[] = [];
    let y = 0;
    for (const row of virtualRows) {
      offsets.push(y);
      y += row.type === 'header' ? HEADER_HEIGHT : ROW_HEIGHT;
    }
    return { offsets, totalHeight: y };
  }, [virtualRows]);

  // ── Category top positions for scroll tracking ───────────────────────────
  const categoryOffsets = useMemo(() => {
    const map: Record<string, number> = {};
    virtualRows.forEach((row, i) => {
      if (row.type === 'header') {
        map[row.categoryId] = rowOffsets.offsets[i];
      }
    });
    return map;
  }, [virtualRows, rowOffsets]);

  // ── Viewport height ───────────────────────────────────────────────────────
  const VIEWPORT_HEIGHT = 320;
  const OVERSCAN = 3;

  // ── Compute visible rows ──────────────────────────────────────────────────
  const visibleRows = useMemo(() => {
    const { offsets, totalHeight } = rowOffsets;
    const top = scrollTop;
    const bottom = top + VIEWPORT_HEIGHT;

    let startIdx = 0;
    let endIdx = virtualRows.length - 1;

    // binary search for start
    let lo = 0, hi = offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (offsets[mid] < top) lo = mid + 1;
      else hi = mid;
    }
    startIdx = Math.max(0, lo - OVERSCAN);

    // linear scan for end
    for (let i = startIdx; i < virtualRows.length; i++) {
      if (offsets[i] > bottom) {
        endIdx = Math.min(virtualRows.length - 1, i + OVERSCAN);
        break;
      }
    }

    return { startIdx, endIdx, totalHeight };
  }, [scrollTop, rowOffsets, virtualRows]);

  // ── Scroll handler → update active category ──────────────────────────────
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const st = (e.target as HTMLDivElement).scrollTop;
      setScrollTop(st);

      if (isScrollingProgrammatically.current) return;

      // Determine which category header is at / above current scroll
      // Démarre avec la première catégorie visible (récents ou smileys)
      let found = allCategories[0]?.id ?? EMOJI_DATA[0].id;
      for (const [catId, offset] of Object.entries(categoryOffsets)) {
        if (offset <= st + 8) found = catId;
      }
      setActiveCategory(found);
    },
    [categoryOffsets, allCategories]
  );

  // ── Click category tab → scroll to it ────────────────────────────────────
  const scrollToCategory = useCallback(
    (catId: string) => {
      if (!scrollRef.current) return;
      const offset = categoryOffsets[catId];
      if (offset == null) return;
      isScrollingProgrammatically.current = true;
      scrollRef.current.scrollTo({ top: offset, behavior: 'smooth' });
      setActiveCategory(catId);
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 600);
    },
    [categoryOffsets]
  );

  // ── Emoji click : insertion + mise à jour des récents ────────────────────
  const handleEmojiClick = useCallback(
    (emoji: string) => {
      console.log(textareaRef.current);
      if (textareaRef.current) {
        insertEmojiIntoTextarea(textareaRef.current, emoji);
      }

      // Mise à jour des récents si un userId est disponible
      if (userId) {
        setRecentEmojis((prev) => {
          const updated = addToRecents(prev, emoji);
          const cookieKey = buildRecentCookieKey(userId);
          // expires dans 365 jours, accessible sur tout le domaine
          cookies.set(cookieKey, JSON.stringify(updated), {
            expires: 365,
            path: '/',
            sameSite: 'lax',
          });
          return updated;
        });
      }

      onEmojiInsert?.(emoji);
    },
    [textareaRef, onEmojiInsert, userId, cookies]
  );

  // ── Reset scroll on new search ────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [searchQuery]);

  const { startIdx, endIdx, totalHeight } = visibleRows;

  return (
    <div
      className={`emoji-picker ${className}`}
      ref={containerRef}
    >
      <style>{`
        .emoji-picker {
          display: flex;
          flex-direction: column;
          width: 352px;
          background: var(--ep-bg);
          border-radius: var(--ep-radius);
          border: 1px solid var(--ep-border);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          user-select: none;
        }

        /* ── Category tabs ── */
        .ep-tabs {
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--ep-border);
          background: var(--ep-bg);
          overflow-x: auto;
          scrollbar-width: none;
          flex-shrink: 0;
        }
        .ep-tabs::-webkit-scrollbar { display: none; }

        .ep-tab {
          flex: 1;
          min-width: 36px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          border: none;
          background: transparent;
          position: relative;
          transition: background 0.15s;
          padding: 0;
          border-bottom: 2px solid transparent;
          box-sizing: border-box;
        }
        .ep-tab:hover { background: var(--ep-hover); }
        .ep-tab.active {
          border-bottom-color: var(--ep-active-tab);
        }
        .ep-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0; right: 0;
          height: 2px;
          background: var(--ep-active-tab);
          border-radius: 2px 2px 0 0;
        }

        /* Séparateur visuel après l'onglet "récent" */
        .ep-tab-recent {
          position: relative;
        }
        .ep-tab-recent::before {
          content: '';
          position: absolute;
          right: 0;
          top: 20%;
          height: 60%;
          width: 1px;
          background: var(--ep-border);
        }

        /* ── Search ── */
        .ep-search {
          padding: 8px 10px;
          border-bottom: 1px solid var(--ep-border);
          flex-shrink: 0;
        }
        .ep-search-inner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--ep-search-bg);
          border-radius: 8px;
          padding: 6px 10px;
        }
        .ep-search-icon {
          color: var(--ep-text-muted);
          font-size: 14px;
          flex-shrink: 0;
        }
        .ep-search-input {
          border: none;
          background: transparent;
          outline: none;
          color: var(--ep-text);
          font-size: 14px;
          width: 100%;
          caret-color: var(--ep-accent);
        }
        .ep-search-input::placeholder { color: var(--ep-text-muted); }

        /* ── Scroll container ── */
        .ep-scroll {
          overflow-y: auto;
          overflow-x: hidden;
          height: ${VIEWPORT_HEIGHT}px;
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: var(--ep-border) transparent;
          margin-bottom: 2px;
        }
        .ep-scroll::-webkit-scrollbar { width: 4px; }
        .ep-scroll::-webkit-scrollbar-track { background: transparent; }
        .ep-scroll::-webkit-scrollbar-thumb {
          background: var(--ep-border);
          border-radius: 2px;
        }

        .ep-virtual-space {
          position: relative;
        }

        /* ── Category header ── */
        .ep-cat-header {
          height: ${HEADER_HEIGHT}px;
          display: flex;
          align-items: center;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ep-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          position: absolute;
          left: 0; right: 0;
          box-sizing: border-box;
        }

        /* ── Emoji row ── */
        .ep-emoji-row {
          height: ${ROW_HEIGHT}px;
          display: flex;
          align-items: center;
          padding: 2px 4px;
          position: absolute;
          left: 15px; right: 0;
          box-sizing: border-box;
        }

        /* ── Emoji button ── */
        .ep-emoji-btn {
          width: ${EMOJI_SIZE}px;
          height: ${EMOJI_SIZE}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          cursor: pointer;
          border: none;
          background: transparent;
          border-radius: 6px;
          transition: background 0.1s, transform 0.1s;
          padding: 0;
          line-height: 1;
          flex-shrink: 0;
        }
        .ep-emoji-btn:hover {
          background: var(--ep-hover);
          transform: scale(1.15);
        }
        .ep-emoji-btn:active {
          transform: scale(0.95);
          background: var(--ep-search-bg);
        }

        /* ── Empty state ── */
        .ep-empty {
          height: ${VIEWPORT_HEIGHT}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--ep-text-muted);
          font-size: 13px;
        }
        .ep-empty-icon { font-size: 36px; }
      `}</style>

      {/* ── Category tabs ── */}
      {!searchQuery && (
        <div className="ep-tabs" role="tablist">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              aria-label={cat.label}
              className={`ep-tab${activeCategory === cat.id ? ' active' : ''}${cat.id === 'recent' ? ' ep-tab-recent' : ''}`}
              onClick={() => scrollToCategory(cat.id)}
              title={cat.label}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="ep-search">
        <div className="ep-search-inner">
          <span className="ep-search-icon">🔍</span>
          <input
            ref={searchInputRef}
            className="ep-search-input"
            type="text"
            placeholder="Rechercher un emoji"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Rechercher un emoji"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ep-text-muted)',
                fontSize: '16px',
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Virtual scroll list ── */}
      {filteredCategories.length === 0 ? (
        <div className="ep-empty">
          <span className="ep-empty-icon">🤔</span>
          <span>Aucun emoji trouvé</span>
        </div>
      ) : (
        <div
          className="ep-scroll"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div
            className="ep-virtual-space"
            style={{ height: totalHeight }}
          >
            {virtualRows.slice(startIdx, endIdx + 1).map((row, localIdx) => {
              const globalIdx = startIdx + localIdx;
              const top = rowOffsets.offsets[globalIdx];

              if (row.type === 'header') {
                return (
                  <div
                    key={`header-${row.categoryId}`}
                    className="ep-cat-header"
                    style={{ top }}
                  >
                    {row.categoryLabel}
                  </div>
                );
              }

              return (
                <div
                  key={`row-${row.categoryId}-${row.rowIndex}`}
                  className="ep-emoji-row"
                  style={{ top }}
                >
                  {row.emojis!.map((emojiData) => (
                    <button
                      key={emojiData.emoji}
                      className="ep-emoji-btn"
                      onClick={() => handleEmojiClick(emojiData.emoji)}
                      title={emojiData.name}
                      aria-label={emojiData.name}
                    >
                      {emojiData.emoji}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}