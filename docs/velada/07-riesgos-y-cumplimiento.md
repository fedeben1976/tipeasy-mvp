# 8. Riesgos: tiendas, privacidad y moderación

> Este análisis es orientativo para diseño de producto. Antes del lanzamiento debe validarse con asesoría legal en cada mercado y con la versión vigente de las políticas de Apple y Google, que cambian con frecuencia.

## 8.1 Políticas de App Store (Apple)

| Riesgo | Detalle | Mitigación |
|---|---|---|
| **Contenido sexual explícito** | Las App Review Guidelines (1.1.4) prohíben material “abiertamente sexual o pornográfico”. Apple ha aprobado apps de bienestar sexual y audio erótico, pero con criterio variable. | Posicionamiento de **bienestar sexual** con base clínica. Sin imágenes explícitas (solo ilustración abstracta). Texto y audio literario, no gráfico. Capturas de tienda sin contenido sexual. |
| **Nivel Sin filtro** | Es el más expuesto al rechazo. | Contenido sensual y directo pero no pornográfico. Si Apple lo objeta: plan B es mantenerlo en web (PWA autenticada) y en la app mostrar solo lo que cumpla. Diseñar el sistema de contenidos para poder ajustar por plataforma sin nueva versión. |
| **Clasificación por edad** | Debe declararse la clasificación más alta (18+) y responder el cuestionario de contenido con honestidad. | 18+ declarado; verificación propia además de la de la tienda. |
| **Contenido generado por usuarias (UGC)** | La guideline 1.2 exige filtrado, reporte y bloqueo si hay UGC visible para terceros. | El único UGC compartido es **entre dos personas vinculadas**. Aun así: reportar/bloquear pareja, desvincular unilateral. No hay feed público ni comunidad abierta en el MVP. |
| **Revisión humana** | El equipo de revisión necesita acceder. | Cuenta demo con contenido representativo de todos los niveles y notas de revisión que expliquen el enfoque clínico y la verificación de edad. |
| **Suscripciones** | Reglas de compras dentro de la app, prueba gratis, cancelación clara. | Pantalla de precios transparente, botón para gestionar la suscripción, sin patrones oscuros. |

## 8.2 Políticas de Google Play

| Riesgo | Detalle | Mitigación |
|---|---|---|
| **Política de contenido sexual** | Google Play prohíbe contenido sexual cuyo propósito sea la gratificación sexual, con excepciones para fines educativos, científicos o de salud sexual. | Framing clínico y educativo explícito en la ficha y dentro de la app (cada mecánica explica su base). Relatos enmarcados como ejercicios de mindfulness erótico. |
| **Público objetivo y familias** | Declarar público 18+ y excluir la app de programas para familias. | Declaración de público objetivo 18+; sin elementos que atraigan a menores (nada de estética infantil, personajes animados). |
| **Sección de seguridad de datos** | Declarar qué datos se recopilan. | Local-first y cifrado E2E: declarar datos mínimos (cuenta, pagos, diagnóstico anónimo opcional). |
| **Anuncios de la app** | Las políticas de Google Ads y Meta restringen la promoción de contenido para adultos. | Estrategia de adquisición orgánica y con creadoras (ver [lanzamiento](06-negocio-y-lanzamiento.md#canales-considerando-restricciones-publicitarias-del-rubro)). |

**Plan de contingencia general:** versión web (PWA) con cuenta compartida, para no depender al 100 % de la aprobación de las tiendas en los niveles más intensos.

---

## 8.3 Verificación de edad y marco legal

- Leyes de verificación de edad vigentes o en implementación en varios mercados (p. ej., Online Safety Act en Reino Unido, leyes estatales en EE. UU., regulaciones en Australia y en la UE). Se requiere un mapa legal por país antes de cada lanzamiento.
- **Enfoque:** fecha de nacimiento + estimación facial o documento mediante proveedor certificado que no retiene datos + uso de las señales de rango de edad que ofrecen Apple y Google. Se guarda solo un token booleano.
- Bloqueo por dispositivo tras declarar < 18.

---

## 8.4 Privacidad y seguridad de datos

### Por qué es crítico
Los datos sobre vida sexual son **datos sensibles/categoría especial** (art. 9 RGPD en la UE y España; Ley 25.326 en Argentina; LFPDPPP en México; LGPD en Brasil). Una filtración podría causar daño grave: extorsión, violencia, exposición pública.

### Arquitectura de privacidad
| Capa | Decisión |
|---|---|
| **Local-first** | Perfil, Confesionario, Mapa del cuerpo y fotos viven cifrados en el dispositivo. |
| **Cifrado** | AES-256-GCM / XChaCha20-Poly1305 con claves en Secure Enclave / Android Keystore; derivación del PIN con Argon2id. |
| **Modo pareja** | Cifrado de punta a punta (X25519 + protocolo tipo Signal o MLS). El servidor solo transporta blobs cifrados. |
| **Match secreto** | *Private Set Intersection*: ni el servidor ni la otra persona conocen los “No”. Revelación solo al completar el mazo, para impedir inferencias. |
| **Backup** | Opcional, cifrado con una clave que solo tiene ella (frase de recuperación). Sin backup en iCloud/Google en texto plano. |
| **Minimización** | Sin nombre real obligatorio. Email o “Iniciar sesión con Apple” (con email oculto). Analítica agregada y anónima, opt-in, **nunca** sobre contenido ni respuestas. |
| **Borrado total** | Borrado criptográfico (se destruyen las claves) + borrado de blobs en servidor en ≤ 24 h + desvinculación. |
| **Discreción** | Íconos alternativos, notificaciones neutras, bloqueo de capturas de pantalla, desenfoque en el selector de apps, PIN señuelo, cierre rápido con gesto. |
| **Terceros** | Sin SDKs publicitarios. Proveedores (pagos, verificación de edad, audio CDN) con acuerdos de tratamiento de datos. |
| **Auditoría** | Pentest externo antes del lanzamiento y anualmente; programa de divulgación responsable de vulnerabilidades; informe de transparencia anual. |
| **Pedidos de autoridades** | Por diseño, no tenemos acceso al contenido. Se documenta en la política de privacidad. |

### Consentimiento
- Consentimiento **explícito y granular** para el tratamiento de datos sensibles (requisito del RGPD y leyes similares), separado de los términos generales.
- Compartir con la pareja: confirmación **pregunta por pregunta**, con vista previa de lo que la otra persona va a ver.
- Política de privacidad en lenguaje claro, con resumen de 5 líneas al inicio.

---

## 8.5 Seguridad emocional y relacional

| Riesgo | Mitigación |
|---|---|
| **Coerción en la pareja** (alguien presiona para ver respuestas o para jugar) | Nadie puede ver el Confesionario ni el perfil ajeno. Desvincular unilateral y silencioso. PIN señuelo. El nivel activo en pareja es el más bajo. Recurso visible: *¿Te sentís presionada?* con información y líneas de ayuda por país (ej. Línea 144 en Argentina, 016 en España). |
| **Contenido que active trauma** | Límites por tema en el onboarding que ocultan contenido. Advertencias de contenido por relato. Pausa siempre visible con ejercicio de regulación (respiración 4-6). Directorio de profesionales. |
| **Presión de rendimiento** | Lenguaje sin metas, sin métricas sexuales, sin comparaciones ni rankings. |
| **Dependencia o uso compulsivo** | Sin rachas ni FOMO; máximo de notificaciones; sin reproducción automática infinita. |
| **Fantasías que incomodan** | Mensajes de normalización basados en evidencia: fantasear no es desear literalmente ni prometer. |
| **Brecha de deseo en la pareja** | Contenido educativo sobre deseo responsivo y discrepancia de deseo; nunca se muestra “quién quiere más”. |

---

## 8.6 Moderación de contenidos

- **Contenido editorial (cartas, relatos):** 100 % creado y revisado internamente por el equipo clínico y editorial. Checklist: consentimiento explícito, ausencia de menores o apariencia infantil, sin violencia no consensuada, sin sustancias, sin actividades ilegales, sin estereotipos, lenguaje inclusivo.
- **Contenido privado de usuarias:** cifrado E2E, **no se modera ni se lee**. Se informa claramente en los términos que el contenido compartido con la pareja es responsabilidad de ambas partes.
- **Contenido compartido entre parejas:** herramienta de **reporte** (la persona que reporta puede adjuntar voluntariamente el contenido descifrado) + bloqueo + desvinculación.
- **Material ilegal:** política de tolerancia cero; canal de denuncia y cooperación con autoridades en lo que técnicamente sea posible, sin romper el cifrado para el resto de las usuarias.
- **Funciones con IA** (ej. asistente de Cartas de sueños): modelo con filtros que bloquean menores, no consentimiento, violencia real e ilegalidad; procesamiento en el dispositivo cuando sea posible; si se usa un servicio en la nube, sin retención de datos y con consentimiento específico.
- **Futuro (comunidad):** si se agrega un espacio de relatos compartidos entre usuarias, requerirá moderación humana previa a la publicación, reportes, bloqueo y políticas de UGC específicas de cada tienda. No forma parte del MVP.

---

## 8.7 Riesgos de negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Rechazo o retiro de tiendas | Media | Alto | Framing clínico, PWA de respaldo, relación con equipos de revisión, contenido ajustable por plataforma. |
| Procesadores de pago que restringen el rubro | Media | Alto | Priorizar compras dentro de la app; procesador web especializado en bienestar con aprobación previa. |
| Filtración de datos | Baja (por diseño) | Crítico | Local-first, E2E, auditorías, datos mínimos. |
| Baja conversión | Media | Medio | Ajustar el muro de pago con pruebas A/B éticas (sin patrones oscuros). |
| Reputación (“app porno”) | Media | Medio | Respaldo de especialistas, prensa de bienestar, estética cuidada. |
| Competencia (Dipsea, Ferly, Coral, Kindu, Desire) | Alta | Medio | Diferencial: español/LATAM, modo sola + pareja integrado, Match secreto con privacidad criptográfica, base científica explícita y anticipación como mecánica central. |
