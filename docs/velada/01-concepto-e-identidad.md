# 1. Nombre, concepto y tagline

## Tres opciones

### Opción A — **Velada** ⭐ recomendada
- **Concepto:** una velada es una noche preparada con intención, y también algo *velado*: cubierto, privado, que se revela cuando ella quiere. Une las dos promesas del producto: **anticipación** y **privacidad**.
- **Tagline principal:** *Tu deseo, a tu ritmo.*
- **Alternativas:** *Lo que sentís, bajo tu llave.* · *Despertá lo que ya es tuyo.*
- **Por qué gana:** es discreto (en la pantalla del teléfono no delata nada), funciona en español y portugués (“velada” / “velado”), el ícono puede ser una luna creciente o un velo sin connotación explícita, y el nombre invita a un ritual, no a una “performance”.

### Opción B — **Musa**
- **Concepto:** ella no es la que inspira a otros: es su propia musa. Autofoco erótico hecho marca.
- **Tagline:** *Vos sos la escena.*
- **Riesgo:** nombre muy usado en marcas de belleza; más difícil de registrar y posicionar en tiendas.

### Opción C — **Brasa**
- **Concepto:** el deseo no siempre es un incendio; a veces es una brasa que se aviva con aire y tiempo. Deseo responsivo hecho marca.
- **Tagline:** *No hace falta estar encendida para empezar.*
- **Riesgo:** choca con el nombre del nivel 2 del termómetro y remite a gastronomía (parrilla) en el Río de la Plata.

**Decisión:** avanzamos con **Velada**. El resto del documento usa ese nombre.

---

# 2. Identidad visual

## Personalidad de marca
**Una amiga íntima y sabia, con formación clínica y voz de medianoche.** Nunca vulgar, nunca clínica, nunca moralista. Sensual sin ser porno; cálida sin ser cursi.

| Es | No es |
|---|---|
| Sensual, sugerente, literaria | Pornográfica, gráfica, “hot” de revista |
| Cómplice, curiosa, lúdica | Maternal, pedagógica, sermoneadora |
| Inclusiva (cuerpos, orientaciones, vínculos) | Heteronormativa, “para complacer a tu hombre” |
| Basada en evidencia, pero liviana | Paper académico |

## Paleta
Colores de piel, vino y noche. Se evita el rosa chicle y el rojo “sex shop”.

| Token | Hex | Uso |
|---|---|---|
| `noche` | `#1B1420` | Fondo principal (modo oscuro por defecto: privacidad en la cama y en el colectivo) |
| `vino` | `#6E1F3A` | Acento primario, botones, nivel Fuego |
| `ambar` | `#E8A15C` | Destacados, luz de vela, progreso |
| `piel` | `#F3D9C7` | Texto sobre oscuro, tarjetas en modo claro |
| `ciruela` | `#3A2340` | Superficies, tarjetas |
| `salvia` | `#8FA89A` | **Color de pausa y seguridad** (calma, no alarma) |

**Termómetro (degradé por nivel):** Chispa `#F3D9C7` → Brasa `#E8A15C` → Fuego `#C4502F` → Volcán `#6E1F3A` → Sin filtro `#1B1420` con borde dorado `#D4AF37`.

## Tipografía
- **Títulos:** serif de alto contraste (ej. *Fraunces* o *Playfair Display*): literaria, íntima.
- **Texto y UI:** sans humanista (ej. *Inter* o *DM Sans*) con tamaño mínimo 16 px, buen contraste (WCAG AA).
- **Cartas:** serif en itálica para la frase principal, como si estuviera escrita a mano en una carta.

## Iconografía e imagen
- Ilustraciones abstractas: curvas, sombras, telas, agua, fruta, luz de vela. **Nunca cuerpos explícitos**, nunca rostros (la usuaria se proyecta; además cumple con políticas de tienda).
- Cuerpos, cuando aparecen, en siluetas diversas: tallas, tonos de piel, edades, discapacidades, vello, cicatrices.
- Animaciones lentas (300–600 ms, *ease-out*): todo respira, nada salta.
- **Ícono de la app:** luna creciente dorada sobre fondo noche. Íconos alternativos discretos seleccionables: “Notas”, “Clima”, “Calma” (ver sección de privacidad).

## Sonido y háptica
- Háptica suave tipo “latido” al revelar un match o abrir un sobre.
- Sin sonidos por defecto (privacidad). Opcional: campana de cristal muy baja.

---

## Tono de voz

**Cuatro reglas del UX writing de Velada:**
1. **Ella decide, siempre.** Verbos que ofrecen (“si querés”, “cuando quieras”), nunca que exigen (“tenés que”, “completá”).
2. **Sin culpa y sin rendimiento.** No existen “fallaste”, “perdiste tu racha”, “no terminaste”. No se habla de orgasmos como meta.
3. **Sensorial y concreto.** Temperatura, textura, luz, respiración. Mejor “tibio” que “excitante”.
4. **Inclusivo por diseño.** En modo pareja se dice “tu pareja”, “la otra persona”, “quien recibe”. Nunca se asume el género ni la cantidad de personas del vínculo.

**Localización:** versión rioplatense (voseo) y versión neutra (tuteo) para México/Colombia/España. Los ejemplos están en voseo.

## Microcopy — ejemplos

### Bienvenida y onboarding
| Momento | Texto |
|---|---|
| Splash | *Bienvenida a tu velada.* |
| Intro | *Acá no hay nada que demostrar. Solo cosas para descubrir, a tu ritmo.* |
| Pregunta de perfil | *¿Qué te enciende? Elegí todo lo que resuene. O nada: también vale.* |
| Botón saltear | *Ahora no* |
| Datos opcionales | *Todo lo que nos cuentes queda cifrado en tu teléfono. Ni nosotras podemos leerlo.* |
| Cierre onboarding | *Listo. Tu perfil es un borrador eterno: cambialo cuando quieras.* |

### Termómetro
| Momento | Texto |
|---|---|
| Elegir nivel | *¿Qué temperatura tiene tu noche?* |
| Bajar nivel | *Bajamos a Brasa. Lo tibio también es fuego.* |
| Subir a Sin filtro | *Sin filtro es el nivel más intenso. Podés volver cuando quieras, sin explicaciones.* |

### Saltear, pausar, parar
| Momento | Texto |
|---|---|
| Saltear carta | *Siguiente* (nunca “saltear” con cara triste; solo avanza) |
| Tras varios skips | *¿Querés probar otra temperatura?* (opcional, una vez por sesión, nunca como reproche) |
| Botón de pausa | *Pausa* (siempre visible, color salvia) |
| Pantalla de pausa | *Pausamos. Nadie tiene que explicar nada. Respirá; cuando quieras, seguimos o cerramos.* |
| Pausa en pareja (lo ve la otra persona) | *Se activó la pausa. Es un buen momento para un abrazo, un vaso de agua o nada.* |
| Cerrar sesión de juego | *Gracias por esta velada. Lo que pasó hoy, alcanza.* |

### Match secreto
| Momento | Texto |
|---|---|
| Instrucción | *Marcá Sí, Tal vez o No. Solo van a ver lo que coincide. Tus “No” no existen para nadie.* |
| Match | *Coincidieron en esto. ¿Lo conversan… o lo juegan?* |
| Sin coincidencias | *Esta vez no hubo coincidencias. Eso también es información valiosa: probá otro mazo cuando quieran.* |

### Confesionario
| Momento | Texto |
|---|---|
| Entrada | *Esto es solo tuyo. Escribí como si nadie fuera a leerlo, porque nadie lo va a leer.* |
| Guardar | *Guardado bajo llave.* |
| Compartir (opcional) | *¿Querés mostrarle esta respuesta a tu pareja? Solo esta, y solo si decís que sí.* |

### Notificaciones discretas (por defecto)
- *Tenés una nota nueva.*
- *Algo te espera esta noche.* (nivel de discreción medio, opcional)
- *🌙* (máxima discreción, solo emoji)

### Errores y estados vacíos
- *Algo se trabó. No es tu culpa. Probemos de nuevo.*
- *Tu confesionario está en blanco, como una sábana limpia.*
