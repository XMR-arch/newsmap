// Datos de demostración — se reemplazan con World News API en producción
// weight = alcance estimado (escala relativa para el treemap)

export const REGIONS = {
  latam:    { label: 'Latinoamérica', bg: '#1a0c00', bgHover: '#2e1800', fg: '#f5c07a', accent: '#d4882a', border: '#f0a040' },
  europe:   { label: 'Europa',        bg: '#00050f', bgHover: '#000d20', fg: '#7ab0f5', accent: '#3a70d4', border: '#5090ff' },
  asia:     { label: 'Asia',          bg: '#001209', bgHover: '#002015', fg: '#5adda0', accent: '#1db070', border: '#30e080' },
  namerica: { label: 'N. América',    bg: '#0a0012', bgHover: '#140022', fg: '#c090ff', accent: '#8040e0', border: '#b070ff' },
  africa:   { label: 'África',        bg: '#180c00', bgHover: '#281600', fg: '#ffcc70', accent: '#d09020', border: '#ffcc40' },
  oceania:  { label: 'Oceanía',       bg: '#000f18', bgHover: '#001c2a', fg: '#55d0e8', accent: '#1aa8c0', border: '#40d0e8' },
  mideast:  { label: 'Medio Oriente', bg: '#100900', bgHover: '#1e1200', fg: '#ffd880', accent: '#c0a820', border: '#ffe050' },
}

export const DEMO_PAPERS = [
  // N. América
  { id:'nyt',  cat:'namerica', name:'New York Times',    city:'Nueva York',     country:'us', weight:24, readers:'12.4M', headline:'Elecciones 2026: la grieta se profundiza en ambas cámaras del Congreso.' },
  { id:'wapo', cat:'namerica', name:'Washington Post',   city:'Washington DC',  country:'us', weight:18, readers:'7.2M',  headline:'IA y empleo: el informe que nadie quería publicar sale hoy a la luz.' },
  { id:'lat',  cat:'namerica', name:'Los Angeles Times', city:'Los Ángeles',    country:'us', weight:11, readers:'4.1M',  headline:'California declara emergencia climática por tercera vez consecutiva.' },
  { id:'glob', cat:'namerica', name:'Globe & Mail',      city:'Toronto',        country:'ca', weight:8,  readers:'1.9M',  headline:'Ottawa refuerza lazos con la UE ante tensión con Washington.' },

  // Latinoamérica
  { id:'clar', cat:'latam', name:'Clarín',          city:'Buenos Aires',    country:'ar', weight:22, readers:'9.8M',  headline:'El dólar tocó nuevo récord y el Gobierno convocó al FMI de urgencia.' },
  { id:'lnac', cat:'latam', name:'La Nación',       city:'Buenos Aires',    country:'ar', weight:13, readers:'4.2M',  headline:'Reformas laborales: el Congreso sesiona esta noche en sesión extraordinaria.' },
  { id:'folh', cat:'latam', name:'Folha de S.Paulo',city:'São Paulo',       country:'br', weight:16, readers:'5.8M',  headline:'Lula suspende exportaciones de soja tras crisis hídrica en el Amazonas.' },
  { id:'tiemp',cat:'latam', name:'El Tiempo',       city:'Bogotá',          country:'co', weight:9,  readers:'2.1M',  headline:'Paz total en jaque: disidencias FARC rompen acuerdo en el Catatumbo.' },
  { id:'univ', cat:'latam', name:'El Universal',    city:'Ciudad de México', country:'mx', weight:12, readers:'3.4M',  headline:'Sheinbaum presenta plan de infraestructura ferroviaria para 2027.' },
  { id:'terc', cat:'latam', name:'La Tercera',      city:'Santiago',         country:'cl', weight:7,  readers:'1.8M',  headline:'Chile lidera ranking de energía solar en América del Sur.' },
  { id:'com',  cat:'latam', name:'El Comercio',     city:'Lima',             country:'pe', weight:5,  readers:'1.2M',  headline:'Perú: crisis política escala con interpelación al gabinete.' },

  // Europa
  { id:'lemon',cat:'europe', name:'Le Monde',           city:'París',      country:'fr', weight:20, readers:'8.4M',  headline:'Macron anuncia referéndum sobre reforma constitucional para otoño.' },
  { id:'spieg',cat:'europe', name:'Der Spiegel',         city:'Hamburgo',   country:'de', weight:16, readers:'6.1M',  headline:'Alemania: AfD supera al SPD en encuestas nacionales por primera vez.' },
  { id:'guar', cat:'europe', name:'The Guardian',        city:'Londres',    country:'gb', weight:22, readers:'9.6M',  headline:'UK: Starmer enfrenta rebelión interna por política de inmigración.' },
  { id:'elpais',cat:'europe',name:'El País',             city:'Madrid',     country:'es', weight:14, readers:'5.2M',  headline:'Sánchez reforma fiscal con apoyo de Podemos y rechazo del PP.' },
  { id:'corr', cat:'europe', name:'Corriere della Sera', city:'Milán',      country:'it', weight:11, readers:'3.8M',  headline:'Meloni y Draghi: el duelo que define el futuro de Italia en la UE.' },
  { id:'volk', cat:'europe', name:'De Volkskrant',       city:'Ámsterdam',  country:'nl', weight:5,  readers:'1.1M',  headline:'Países Bajos cierra acuerdo de coalición tras seis meses de negociaciones.' },

  // Asia
  { id:'asahi',cat:'asia', name:'Asahi Shimbun',  city:'Tokio',     country:'jp', weight:20, readers:'7.2M',  headline:'Japón refuerza su flota naval ante escalada de tensiones en el Pacífico.' },
  { id:'peop', cat:'asia', name:"People's Daily", city:'Pekín',     country:'cn', weight:22, readers:'5.0M',  headline:'Xi Jinping presenta el nuevo plan quinquenal con foco en autosuficiencia.' },
  { id:'hindu',cat:'asia', name:'The Hindu',      city:'Chennai',   country:'in', weight:10, readers:'2.5M',  headline:'India supera a China en exportaciones tecnológicas por primer trimestre.' },
  { id:'chos', cat:'asia', name:'Chosun Ilbo',    city:'Seúl',      country:'kr', weight:12, readers:'3.2M',  headline:'Corea del Sur y Japón firman acuerdo de defensa histórico en Tokio.' },
  { id:'str',  cat:'asia', name:'Straits Times',  city:'Singapur',  country:'sg', weight:6,  readers:'1.4M',  headline:'ASEAN debate moneda común ante debilidad del dólar en mercados.' },

  // África
  { id:'nat',  cat:'africa', name:'Daily Nation',    city:'Nairobi',        country:'ke', weight:9, readers:'1.8M',  headline:'África Oriental: sequía afecta a 12 millones en cuatro países.' },
  { id:'mav',  cat:'africa', name:'Daily Maverick',  city:'Johannesburgo',  country:'za', weight:8, readers:'1.2M',  headline:'Ramaphosa ante el parlamento: crisis energética y desempleo en el centro.' },
  { id:'lmaf', cat:'africa', name:'Le Monde Afrique',city:'Dakar',          country:'sn', weight:5, readers:'0.9M',  headline:'Sahel: nuevos golpes de estado amenazan el corredor democrático.' },

  // Oceanía
  { id:'smh',  cat:'oceania', name:'Sydney Morning Herald',city:'Sídney',    country:'au', weight:14, readers:'3.8M',  headline:'Australia anuncia independencia energética para 2035 con hidrógeno verde.' },
  { id:'taus', cat:'oceania', name:'The Australian',       city:'Melbourne',  country:'au', weight:9,  readers:'2.1M',  headline:'Costo de vida: los australianos gastan un 34% más que hace tres años.' },
  { id:'nzh',  cat:'oceania', name:'NZ Herald',            city:'Auckland',   country:'nz', weight:5,  readers:'0.9M',  headline:'Nueva Zelanda eleva alerta volcánica en la Isla Norte.' },

  // Medio Oriente
  { id:'alj',  cat:'mideast', name:'Al Jazeera',  city:'Doha',      country:'qa', weight:20, readers:'8.2M',  headline:'Gaza: negociaciones de tregua en El Cairo entran en fase decisiva.' },
  { id:'haar', cat:'mideast', name:'Haaretz',     city:'Tel Aviv',  country:'il', weight:8,  readers:'1.1M',  headline:'Tribunal Supremo frena ley de exenciones militares para ultraortodoxos.' },
  { id:'arab', cat:'mideast', name:'Arab News',   city:'Riad',      country:'sa', weight:9,  readers:'1.8M',  headline:'Arabia Saudita abre al turismo 12 nuevos sitios arqueológicos en Hegra.' },
]
