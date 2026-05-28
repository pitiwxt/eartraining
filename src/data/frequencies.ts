export interface FrequencyData {
  value: number; // in Hz
  label: string;
  nameEn: string;
  nameTh: string;
  band: 'sub-bass' | 'bass' | 'low-mids' | 'midrange' | 'upper-mids' | 'presence' | 'brilliance';
  bandLabelEn: string;
  bandLabelTh: string;
  color: string; // Tailwind accent color or hex
  descriptionEn: string;
  descriptionTh: string;
  instrumentsEn: string[];
  instrumentsTh: string[];
}

export interface SongData {
  id: string;
  labelEn: string;
  labelTh: string;
  fileNameSuffix: string;
}

export const frequencies: FrequencyData[] = [
  {
    value: 40,
    label: '40 Hz',
    nameEn: 'Sub-Bass (Rumble)',
    nameTh: 'ซับเบส (ความสั่นสะเทือน)',
    band: 'sub-bass',
    bandLabelEn: 'Sub-Bass',
    bandLabelTh: 'ซับเบส',
    color: '#8b5cf6', // violet
    descriptionEn: 'The lowest octave of human hearing. Felt more than heard as physical rumble. Boosts add weight and rumble to kick drums and synth bass, but too much will make the entire mix muddy, boomy, and consume headroom.',
    descriptionTh: 'ย่านความถี่ต่ำสุดที่มนุษย์ได้ยิน รู้สึกได้มากกว่าการได้ยินในฐานะแรงสั่นสะเทือนทางกายภาพ การบูสต์จะช่วยเพิ่มความหนาหนักให้กลองกระเดื่อง (Kick) และซับเบส แต่หากเพิ่มมากเกินไปจะทำให้มิกซ์เบลอ บวม และกินพลังงานของเสียงโดยรวม',
    instrumentsEn: ['Sub-bass', 'Kick drum sub', 'Synthesizers', 'Cinematic sub-booms'],
    instrumentsTh: ['ซับเบส', 'เสียงกระเดื่องกลองย่านลึก', 'เครื่องสังเคราะห์เสียง', 'เสียงระเบิดในภาพยนตร์']
  },
  {
    value: 70,
    label: '70 Hz',
    nameEn: 'Low Bass (Weight & Power)',
    nameTh: 'เบสต่ำ (พลังงานและน้ำหนัก)',
    band: 'bass',
    bandLabelEn: 'Bass',
    bandLabelTh: 'เบส',
    color: '#6366f1', // indigo
    descriptionEn: 'The core body and weight of bass guitars and kick drums. Provides the physical "punch" in the chest. Too much leads to boominess, while too little leaves the mix sounding thin and weak.',
    descriptionTh: 'เนื้อเสียงหลักและพลังงานของกีตาร์เบสและกระเดื่องกลอง ให้แรงปะทะที่สัมผัสได้ที่อก (Chest punch) บูสต์มากเกินไปจะอื้ออึงและกลบเครื่องดนตรีอื่น บูสต์น้อยเกินไปจะทำให้เสียงบาง ไร้พลัง',
    instrumentsEn: ['Kick drum body', 'Bass guitar', 'Floor toms', 'Synth bass'],
    instrumentsTh: ['เนื้อเสียงกระเดื่อง', 'กีตาร์เบส', 'กลองทอมใหญ่ (Floor Tom)', 'เบสสังเคราะห์']
  },
  {
    value: 110,
    label: '110 Hz',
    nameEn: 'Low-Mid Bass (Warmth & Body)',
    nameTh: 'เบสกลางต่ำ (ความอบอุ่นและมวลเสียง)',
    band: 'bass',
    bandLabelEn: 'Bass / Low Mids',
    bandLabelTh: 'เบส / กลางต่ำ',
    color: '#3b82f6', // blue
    descriptionEn: 'Where bass and low-mids meet. Adds body and warmth to snare drums, toms, and low male vocals. Excess here causes a muddy build-up, especially in dense arrangements.',
    descriptionTh: 'ย่านรอยต่อระหว่างเสียงเบสและเสียงกลางต่ำ ช่วยเพิ่มเนื้อเสียงและความอบอุ่นให้กลองสแนร์, กลองทอม และเสียงร้องชายโทนต่ำ หากสะสมมากเกินไปจะส่งผลให้เสียงเกิดความโคลนขุ่นมัว (Muddy)',
    instrumentsEn: ['Bass guitar definition', 'Male vocals', 'Acoustic guitar body', 'Toms'],
    instrumentsTh: ['ความชัดเจนของเบส', 'เสียงร้องคีย์ต่ำ', 'บอดี้ของกีตาร์โปร่ง', 'กลองทอม']
  },
  {
    value: 160,
    label: '160 Hz',
    nameEn: 'Upper Bass / Low Mids (Punch & Warmth)',
    nameTh: 'เบสบน (แรงปะทะและโทนอุ่น)',
    band: 'low-mids',
    bandLabelEn: 'Low Midrange',
    bandLabelTh: 'เสียงกลางต่ำ',
    color: '#0ea5e9', // sky
    descriptionEn: 'Provides fundamental punch for snare drums and the lower body of electric guitars and vocals. Critical for the transition between low-end power and midrange clarity. Excess makes the mix boxy or bloated.',
    descriptionTh: 'ให้แรงปะทะ (Punch) หลักของสแนร์ และเป็นฐานเสียงย่านล่างของกีตาร์ไฟฟ้าและเสียงร้องชาย เป็นย่านสำคัญที่ช่วยเชื่อมระหว่างพลังย่านต่ำและความชัดย่านกลาง บูสต์มากไปจะทำให้อุดอู้และบวม',
    instrumentsEn: ['Snare drum punch', 'Electric guitar body', 'Male vocal chest resonance', 'Keyboard keys'],
    instrumentsTh: ['แรงปะทะของกลองสแนร์', 'เนื้อเสียงกีตาร์ไฟฟ้า', 'เสียงสะท้อนช่วงอกของเสียงร้อง', 'เสียงคีย์บอร์ด']
  },
  {
    value: 250,
    label: '250 Hz',
    nameEn: 'Low-Mid Clarity (Thickness vs Mud)',
    nameTh: 'กลางต่ำ (ความหนาแน่นและความขุ่น)',
    band: 'low-mids',
    bandLabelEn: 'Low Midrange',
    bandLabelTh: 'เสียงกลางต่ำ',
    color: '#06b6d4', // cyan
    descriptionEn: 'Adds fullness and warmth to acoustic guitars, pianos, and vocals. This is the prime accumulation zone for "mud" in music mixes. Cutting here often increases clarity, while boosting adds rich thickness.',
    descriptionTh: 'ช่วยเพิ่มความเต็มอิ่มและหนาให้กีตาร์โปร่ง, เปียโน และเสียงร้อง เป็นย่านหลักที่สะสมความเบลอขุ่น (Clutter/Mud) ของเสียงดนตรี การคัทมักช่วยเพิ่มความสะอาดใส ส่วนการบูสต์ช่วยเพิ่มความหนาอบอุ่น',
    instrumentsEn: ['Vocals', 'Piano lower register', 'Acoustic guitar', 'Snare ring'],
    instrumentsTh: ['เสียงร้อง', 'เปียโนย่านต่ำ', 'กีตาร์อคูสติก', 'เสียงหางสแนร์']
  },
  {
    value: 400,
    label: '400 Hz',
    nameEn: 'Midrange (Boxy Resonance)',
    nameTh: 'เสียงกลางต่ำ (เสียงกล่องกระดาษ)',
    band: 'midrange',
    bandLabelEn: 'Midrange',
    bandLabelTh: 'เสียงกลาง',
    color: '#10b981', // emerald
    descriptionEn: 'Often called the "boxy" or "woody" frequency. Excess in this band makes instruments sound as if they are playing inside a cardboard box. Proper control here makes elements sound organic and natural.',
    descriptionTh: 'มักถูกเรียกว่าย่านเสียงกล่องกระดาษ (Boxy) หรือเสียงไม้ (Woody) หากย่านนี้มีมากเกินไปจะทำให้เครื่องดนตรีฟังดูอุดอู้เหมือนเล่นอยู่ในกล่องกระดาษ การจัดการที่ดีจะช่วยให้เครื่องดนตรีฟังดูเป็นธรรมชาติ',
    instrumentsEn: ['Toms body', 'Acoustic instruments', 'Electric guitar warmth', 'Snare body'],
    instrumentsTh: ['ตัวตนกลองทอม', 'เครื่องดนตรีอคูสติก', 'ความอุ่นกีตาร์ไฟฟ้า', 'บอดี้สแนร์']
  },
  {
    value: 700,
    label: '700 Hz',
    nameEn: 'Midrange (Honk & Tinny)',
    nameTh: 'เสียงกลาง (เสียงแตร/กระป๋อง)',
    band: 'midrange',
    bandLabelEn: 'Midrange',
    bandLabelTh: 'เสียงกลาง',
    color: '#84cc16', // lime
    descriptionEn: 'Provides tone and definition for instrumentation. Excess leads to a cheap "honky" or "tinny" quality, reminiscent of a megaphone or megaphone effect. Crucial for bringing guitars forward in the mix.',
    descriptionTh: 'ให้โทนเสียงและรายละเอียดที่เด่นชัดแก่เครื่องดนตรี บูสต์มากเกินไปจะทำให้ฟังดูเกร็ง แข็งกระด้าง และแหบเหมือนเสียงแตรหรือสังกะสี (Honky/Tinny) เป็นย่านสำคัญในการดันเสียงกีตาร์ให้เด่นขึ้น',
    instrumentsEn: ['Electric guitars', 'Vocals midrange projection', 'Brass', 'Snare rattle'],
    instrumentsTh: ['กีตาร์ไฟฟ้า', 'ความเด่นเสียงร้องย่านกลาง', 'เครื่องเป่าทองเหลือง', 'เสียงแส้สแนร์']
  },
  {
    value: 1000,
    label: '1000 Hz',
    nameEn: 'Midrange (Nasal & Telephone)',
    nameTh: 'เสียงกลาง (เสียงขึ้นจมูก/โทรศัพท์)',
    band: 'midrange',
    bandLabelEn: 'Midrange',
    bandLabelTh: 'เสียงกลาง',
    color: '#eab308', // yellow
    descriptionEn: 'The center of human speech intelligibility. Excess sounds highly nasal, harsh, or phone-like, creating quick ear fatigue. Controlled boosts can highlight vocal details and lyrics.',
    descriptionTh: 'จุดศูนย์กลางของความชัดเจนของคำพูดมนุษย์ หากบูสต์มากเกินไปจะทำให้เสียงฟังดูบีบแหบ ขึ้นจมูก (Nasal) หรือคล้ายเสียงคุยโทรศัพท์ ทำให้ล้าหูได้ง่าย การจัดการที่เหมาะสมช่วยให้ได้ยินคำร้องชัดเจน',
    instrumentsEn: ['Vocal intelligibility', 'Guitars cut', 'Piano midrange', 'String attack'],
    instrumentsTh: ['ความเข้าใจคำร้อง', 'การตัดผ่านของกีตาร์', 'เปียโนย่านกลาง', 'การดีดสายเครื่องสาย']
  },
  {
    value: 2500,
    label: '2500 Hz',
    nameEn: 'Upper Midrange (Clarity & Bite)',
    nameTh: 'กลางสูง (ความคมชัดและเสียงขบ)',
    band: 'upper-mids',
    bandLabelEn: 'Upper Midrange',
    bandLabelTh: 'เสียงกลางสูง',
    color: '#f97316', // orange
    descriptionEn: 'The frequency range where the human ear is most sensitive. Boosts add edge, projection, and "bite" to guitars, vocal articulation, and the snap of kick and snare drum beaters. Excess causes piercing pain and severe fatigue.',
    descriptionTh: 'ย่านที่หูมนุษย์อ่อนไหวและตอบสนองได้เร็วที่สุด การบูสต์ย่านนี้ช่วยเพิ่มความคมและกัด (Bite) ให้กีตาร์, เสียงร้อง และเสียงเคาะของกระเดื่องและสแนร์ บูสต์มากไปจะทำให้เสียงแหบ แข็งกระด้าง และเจ็บหู',
    instrumentsEn: ['Vocal presence', 'Guitar pick attack', 'Kick beater click', 'Snare crack'],
    instrumentsTh: ['ประกายเสียงร้อง', 'เสียงปิ๊กกีตาร์', 'เสียงหัวค้อนกระเดื่อง', 'เสียงฟาดสแนร์']
  },
  {
    value: 4500,
    label: '4500 Hz',
    nameEn: 'Presence (Edge & Harshness)',
    nameTh: 'ความเจิดจ้า (ขอบเสียงและเสียงเสียดหู)',
    band: 'presence',
    bandLabelEn: 'Presence',
    bandLabelTh: 'ความชัด/เจิดจ้า',
    color: '#ef4444', // red
    descriptionEn: 'Responsible for the front-to-back perspective of the mix. Boosting brings vocals and lead instruments closer and adds clarity, but too much causes a harsh, grating sound that irritates the listener.',
    descriptionTh: 'ทำหน้าที่กำหนดความใกล้ไกล (Front-to-back perspective) ในมิกซ์ การบูสต์ย่านนี้จะช่วยดึงเสียงร้องและเครื่องดนตรีนำให้ใกล้เข้ามาและชัดขึ้น แต่ถ้ามากไปจะส่งผลให้เสียดหู (Harsh) และระคายเคืองผู้ฟัง',
    instrumentsEn: ['Vocal breathiness/clarity', 'Guitar snap', 'Cymbals brightness', 'Synthesizer leads'],
    instrumentsTh: ['ความโปร่งเด่นของร้อง', 'การดีดตัวของสายกีตาร์', 'ความใสของฉาบแฉ', 'ซินธิไซเซอร์โซโล่']
  },
  {
    value: 8000,
    label: '8000 Hz',
    nameEn: 'High Treble (Brightness & Sibilance)',
    nameTh: 'เสียงแหลม (ความสว่างและเสียงฟู่)',
    band: 'brilliance',
    bandLabelEn: 'Treble / Brilliance',
    bandLabelTh: 'เสียงแหลม / ประกาย',
    color: '#ec4899', // pink
    descriptionEn: 'Adds crisp brightness and definition to cymbals, acoustic instruments, and vocals. This is also the core range of vocal sibilance (the harsh "S", "T", "Ch" sounds). Excess creates sharp sibilance and glassy harshness.',
    descriptionTh: 'ช่วยเพิ่มความสว่างใสและคมชัดให้แก่ฉาบกลอง, กีตาร์โปร่ง และเสียงร้อง และเป็นพื้นที่หลักที่เกิดเสียงพยัญชนะ ส, ซ (Sibilance) หากบูสต์เยอะจะทำให้สากหู (Sizzling) หรือเสียงแตกพร่าเหมือนกระจกแก้ว',
    instrumentsEn: ['Acoustic guitar sparkle', 'Vocal sibilance (S/Z)', 'Hi-hat crispness', 'Tambourine'],
    instrumentsTh: ['ความสว่างกีตาร์โปร่ง', 'เสียงออกเสียง ส, ซ, ช', 'ความกรุ๊งกริ๊งของไฮแฮท', 'แทมบูรีน']
  },
  {
    value: 12000,
    label: '12000 Hz',
    nameEn: 'Air (Sheen & Sparkle)',
    nameTh: 'แอร์ / เสียงประกายลม (มิติและความนุ่มละมุน)',
    band: 'brilliance',
    bandLabelEn: 'Brilliance / Air',
    bandLabelTh: 'เสียงแอร์ / ปลายแหลมสุด',
    color: '#a855f7', // purple
    descriptionEn: 'The highest range of music frequency. Boosting adds high-end "air", expensive gloss, sparkle, and open dimensionality to vocals, strings, and acoustic guitars. Lacks physical punch but creates a premium, professional feel.',
    descriptionTh: 'ย่านความถี่บนสุดในมิกซ์เสียง การบูสต์จะช่วยเพิ่มประกายเสียงระยิบระยับ (Sparkle) และ "ลม" (Air) ให้เสียงร้อง, ไฮแฮท และเครื่องสาย ทำให้ได้ฟีลลิ่งมิกซ์ที่แพง หรูหรา มีความโปร่งมิติ ลอยเบา',
    instrumentsEn: ['Vocal air', 'Hi-hat sheen', 'Acoustic guitar gloss', 'Strings shimmer'],
    instrumentsTh: ['ความพลิ้วเสียงร้อง', 'ประกายไฮแฮท', 'ความหรูหรากีตาร์โปร่ง', 'ประกายมิติเครื่องสาย']
  }
];

export const songs: SongData[] = [
  {
    id: 'all_programming',
    labelEn: 'Electronic / All Programming',
    labelTh: 'อิเล็กทรอนิกส์ (All Programming)',
    fileNameSuffix: 'Song All Programming Sample.wav'
  },
  {
    id: 'live',
    labelEn: 'Full Live Band',
    labelTh: 'วงดนตรีสด (Live Band)',
    fileNameSuffix: 'Song Live Sample.wav'
  },
  {
    id: 'with_live_drums',
    labelEn: 'Live Drums & Bass',
    labelTh: 'กลองสดและเบส (Live Drums & Bass)',
    fileNameSuffix: 'Song with Live Drums Sample.wav'
  },
  {
    id: 'without_drums',
    labelEn: 'Acoustic (No Drums)',
    labelTh: 'อคูสติก (ไม่มีกลอง)',
    fileNameSuffix: 'Song without Drums Sample.wav'
  }
];

export function getAudioPaths(songId: string, freqValue?: number): { original: string; boosted: string } {
  const song = songs.find(s => s.id === songId);
  if (!song) {
    throw new Error(`Song with ID ${songId} not found`);
  }

  const mp3Suffix = song.fileNameSuffix.replace('.wav', '.mp3');
  const original = `/audio/No EQ ${mp3Suffix}`;
  let boosted = '';
  if (freqValue !== undefined) {
    boosted = `/audio/${freqValue} Hz/${freqValue} Hz 7 db Narrow ${mp3Suffix}`;
  }

  return { original, boosted };
}
