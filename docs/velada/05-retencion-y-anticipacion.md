# 6. Mecánicas de retención y de anticipación

## Principios de diseño
1. **Nada decae.** Sin rachas que se pierden, sin fuego que “se apaga” si no entrás. El deseo tiene ciclos (estrés, duelo, posparto, menopausia) y la app no debe castigarlos `[CD]`.
2. **Se premia explorar, no repetir ni “rendir”.** Nunca se mide frecuencia sexual, orgasmos ni duración.
3. **Volver tiene que sentirse como un regalo, no como una obligación.**
4. **La espera es una feature** `[AN]`.

---

## 6.1 Mecánicas de anticipación

| Mecánica | Cómo funciona | Base |
|---|---|---|
| **Sobres lacrados** | Contenidos (cartas, pistas, relatos) que llegan con un sello y una hora de apertura. No se pueden abrir antes. El sello muestra una cuenta regresiva elegante (“se abre en 3 h”). | `[AN]` |
| **Misiones en tres tiempos** | Mañana → mediodía → noche (ver flujo en [arquitectura](02-arquitectura-y-flujos.md#misiones-con-anticipación)). Variante larga: misiones de 48 h y de fin de semana. | `[AN]` `[DR]` |
| **Revelación programada** | El Match secreto y la Revelación en espejo se abren a una hora elegida por ambos, no al instante. | `[AN]` `[AR]` |
| **Relatos por capítulos** | Series de 3–5 episodios (ej. *Habitación 312*, *La galería*) que se liberan de a uno cada 2–3 días. El final de cada episodio deja una pregunta abierta. | `[AN]` |
| **Carta a tu yo del futuro** | Ella escribe una fantasía o deseo y elige cuándo recibirlo (en una semana, un mes). Le vuelve como sobre lacrado. | `[AN]` `[AF]` |
| **“Pensé en vos” asincrónico** | En pareja, un botón para mandar una señal discreta (un 🌙) durante el día. No exige respuesta. Suma anticipación sin presión. | `[AN]` `[AF]` |
| **Desafío de espera** | Mecánica opcional en Volcán: “no tocarse sexualmente durante X horas, solo palabras”. | `[AN]` |

---

## 6.2 Mecánicas de progresión y retención

### La Constelación (progresión por exploración)
- Cada tipo de experiencia nueva enciende una **estrella** en un cielo nocturno personal: primer relato, primera entrada de sueño en el Confesionario, primer match, primera vez que usa la pausa (sí: **usar la pausa también suma**, porque cuidarse es parte del erotismo).
- Las estrellas forman **constelaciones temáticas** (Sensorial, Fantasía, Voz, Espejo, Anticipación, Autocuidado). Completar una desbloquea un mazo o relato nuevo.
- La constelación **nunca se apaga** ni se compara. No es pública ni compartible por defecto.

### Desbloqueos (ejemplos)
| Acción de exploración | Desbloquea |
|---|---|
| Completar 3 ejercicios de Mapa del cuerpo | Mazo “Piel” (sensorial avanzado) |
| Escribir una entrada de cada tipo en el Confesionario | Relato inédito basado en temas elegidos |
| Primer match secreto conversado | Mazo “Acuerdos” (cómo hablar de límites y deseos) |
| Usar la pausa y volver otro día | Relato de 3 min “Volver sin culpa” |
| Actualizar límites | Mazo “Nuevos territorios” (según los nuevos intereses) |

### Temporadas
- Cada 6–8 semanas, una **temporada** temática (ej. *Verano*, *Viajes*, *Lo prohibido*, *Voces*) con 20 cartas, 4 relatos y 2 misiones largas. Genera novedad `[CD]` y motivos de retorno sin FOMO: el contenido de temporadas anteriores queda disponible para suscriptoras.

### Personalización adaptativa
- El algoritmo (local, en el dispositivo) aprende qué tipos de carta completa y cuáles saltea, **sin interpretar el skip como rechazo definitivo**. Ajusta la mezcla, no la juzga.
- Si detecta varias sesiones con skips seguidos, ofrece una sola vez: *¿Querés probar algo más suave o más corto?*

### Rituales, no rachas
- **Ritual semanal opcional:** ella elige un día y hora (ej. “jueves a la noche”). La app prepara un sobre para ese momento. Si no lo abre, el sobre **espera**, no caduca.
- **Check-in de deseo mensual:** 3 preguntas breves (*¿Qué te aceleró este mes? ¿Qué te frenó? ¿Qué querés probar?*). Devuelve un resumen visual de su mapa de aceleradores y frenos, sin puntajes.

### Notificaciones (máximo 3 por semana por defecto)
- Solo se envían si ella las activó. Siempre con el nivel de discreción elegido.
- Tipos: sobre que se abre, pareja que respondió, nuevo capítulo disponible.
- **Nunca** notificaciones de culpa (“te extrañamos”, “hace una semana que no…”).

---

## 6.3 Retención en pareja

- **Reciprocidad visible pero sin marcador:** se muestra “ambos respondieron” sin contar quién respondió más.
- **Acuerdos guardados:** cada match conversado genera un “acuerdo” (límites, palabra de pausa, ideas) que pueden revisar juntos. Da sensación de historia compartida.
- **Álbum de la velada** (opcional, cifrado): una línea por encuentro, escrita por cada uno, que se revela un mes después (*¿Te acordás de…?*). Combina anticipación y memoria `[AN]` `[AR]`.
- **Cuidado posterior:** después de cada misión, carta de *aftercare* opcional.

---

## 6.4 Métricas de éxito (sin métricas de rendimiento sexual)

| Métrica | Objetivo a 6 meses |
|---|---|
| Retención D30 | ≥ 30 % |
| Sesiones semanales por usuaria activa | 2–3 |
| % usuarias que exploran ≥ 3 constelaciones | ≥ 40 % |
| Conversión a pago (freemium → premium) | 6–9 % |
| NPS | ≥ 50 |
| **Indicador de bienestar** (encuesta trimestral opcional, escala FSFI-6 abreviada y pregunta “¿Te sentís más cómoda con tu deseo?”) | Mejora autorreportada en ≥ 50 % |
| % usuarias que usan la pausa sin abandonar la app | Se monitorea como señal de seguridad, no como problema |
