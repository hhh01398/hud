Este texto es una traducción del [texto original](./README.md).

# Humanity Unchained DAO

<!-- TOC -->

- [Humanity Unchained DAO](#humanity-unchained-dao)
    - [Introducción](#introducci%C3%B3n)
- [Reglas Adicionales](#reglas-adicionales)
    - [General](#general)
    - [Aplicación](#aplicaci%C3%B3n)
        - [General](#general)
        - [Sistema de Gestión de Identidad](#sistema-de-gesti%C3%B3n-de-identidad)
        - [Asamblea](#asamblea)
            - [Miembros](#miembros)
            - [Delegados](#delegados)
            - [Escaños](#esca%C3%B1os)
        - [Votaciones](#votaciones)
            - [General](#general)
            - [Fuera de la cadena](#fuera-de-la-cadena)
            - [En la cadena](#en-la-cadena)
            - [Quórum](#qu%C3%B3rum)
        - [Madrina](#madrina)
        - [Monedero](#monedero)
        - [Token](#token)
        - [Emblemas](#emblemas)
            - [Clusters](#clusters)
        - [Programa de refereridos](#programa-de-refereridos)
        - [Infracción de las normas](#infracci%C3%B3n-de-las-normas)
    - [Gestión de servicios fuera de la cadena](#gesti%C3%B3n-de-servicios-fuera-de-la-cadena)
    - [Procedimiento de modificación de las normas adicionales](#procedimiento-de-modificaci%C3%B3n-de-las-normas-adicionales)

<!-- /TOC -->

## Introducción

Somos [Humanity Unchained DAO](https://humanityunchained.org) (o **HUD**, abreviado), una [Organización Autónoma Descentralizada (DAO)](https://es.wikipedia.org/wiki/Organizaci%C3%B3n_aut%C3%B3noma_descentralizada) y una alternativa al monopolio de gobernanza impuesto mundialmente a través de los estados, instituciones transnacionales y grandes corporaciones, y que esclaviza a la humanidad.

Estamos construyendo una nueva civilización basada en el principio del respeto incondicional al consentimiento de los seres humanos. Bajo dicho principio, cualquier sistema de gobierno, tal como constituciones y leyes, políticas monetarias, sistemas de justicia, sistemas electorales, tratados supranacionales, organizaciones religiosas, etc. es ilegítimo *mientras* los seres humanos bajo el dominio de dicho sistema no han hayan dado su [consentimiento](./constitution/CONSTITUTION_ES.md#artículo-2) para acatar las normas de dichos sistemas.

Los principios de nuestra alternativa están escritos en la [Constitución para un Nuevo Acuerdo Mundial](./constitution), que sienta las bases de un nuevo marco de convivencia que permite a los seres humanos que lo deseen elegir y crear las estructuras de gobernanza bajo las que desean vivir.

Los miembros de HUD deben prometer respetar la [Constitución](./constitution) y las [Reglas Adicionales](#TODO), que establecen las normas para construir un *Sistema de Jurado Mundial* que permite la formación de un mercado libre de estructuras de gobernanza en forma de DAOs, las cuales llamamos *contratos sociales inteligentes*. Estos *contratos sociales inteligentes* pueden ser diversos en su propósito, reglas internas, y en la forma en que se organizan socialmente, económicamente, etc. También pueden compartir recursos en el mundo físico, como territorios. En caso de disputa, la DAO celebra un juicio por jurado, cuyo fallo debe ser acatado por los miembros de la DAO.

El jurado está formado por todos los miembros de la DAO o, de forma opcional, por delegados designados por los miembros, creando una [democracia semidirecta](https://es.wikipedia.org/wiki/Democracia_semidirecta) en la [cadena de bloques](https://es.wikipedia.org/wiki/Cadena_de_bloques) que permite a la DAO no sólo celebrar juicios, sino también interactuar colectivamente con otros [contratos inteligentes](https://es.wikipedia.org/wiki/Contrato_inteligente) en la cadena para, por ejemplo, gestionar las finanzas de la DAO o actualizar su código. Para garantizar el principio de 1-humano-1-voto, los miembros deben demostrar que son seres humanos vivos y que no se han registrado varias veces en la DAO. Esto puede hacerse de forma anónima (véase la regla [Identity_1](#Identity_1) para más información).

El fallo del jurado puede hacerse cumplir de varias formas, como expulsando a miembros, revocando roles o confiscando tokens. La DAO tiene dos tipos de tokens: un [token fungible](#token), que sirve de herramienta para crear incentivos económicos dentro de la DAO, y un tipo especial de [token no fungible](https://es.wikipedia.org/wiki/Token_no_fungible) llamado [emblema](#emblems), que se utiliza para nombrar o revocar roles en contratos sociales inteligentes.

Este documento define las especificaciones una posible implementación de las Reglas Adicionales de acuerdo a la [Constitución](./constitution). A diferencia de la [Constitución](./constitution), que no se puede reformar, la DAO [puede cambiar](./constitution/CONSTITUTION_ES.md#artículo-6) cambiar las Reglas Adicionales democráticamente. Por lo tanto, todos los miembros deben ser conscientes de que, mientras sigan siendo miembros, deberán acatar no sólo la Constitución, sino también cualquier versión futura de este documento. Los miembros pueden abandonar voluntariamente la DAO en cualquier momento.

# Reglas Adicionales

## General

<a name="General_1">[General_1]</a>
La DAO se llamará Humanity Unchained DAO

<a name="General_2">[General_2]</a>
El logotipo de la DAO será una figura simplificada de dos formas humanas abrazadas.

<img src="../logo.png"/>

<a name="General_3">[General_3]</a>
El idioma oficial principal de la DAO será el inglés.

<a name="General_4">[General_4]</a>
Los idiomas oficiales secundarios de la DAO serán el chino mandarín y el español.

<a name="General_5">[General_5]</a>
En la medida de lo posible, podrán utilizarse traducciones de las fuentes originales en el idioma principal a los idiomas secundarios para la Constitución, las Normas adicionales y la interfaz de usuario de la aplicación. En caso de discrepancia entre versiones en distintos idiomas, prevalecerá siempre la versión en el idioma principal.

<a name="General_6">[General_6]</a>
Siempre que sea posible, se dará prioridad a la automatización y la descentralización frente a lo manual y centralizado.

<a name="General_7">[General_7]</a>
Los fallos del Jurado prevalecerán sobre las especificaciones. Las especificaciones prevalecerán sobre el código.


## Aplicación


### General

<a name="AppGeneral_1">[AppGeneral_1]</a>
Habrá una app que implemente los requisitos establecidos en la Constitución y en las Normas Adicionales.

<a name="AppGeneral_2">[AppGeneral_2]</a>
La aplicación debe implementarse utilizando una tecnología que sea públicamente accesible, segura, verificable y a prueba de manipulaciones. La DAO podrá decidir si migra o no la aplicación a otras tecnologías más adecuadas a medida que evolucione el estado del arte de las tecnologías descentralizadas.

<a name="AppGeneral_3">[AppGeneral_3]</a>
La aplicación será una aplicación Web3 basada en contratos inteligentes de Ethereum y se desplegará en la cadena de bloques Polygon.

<a name="AppGeneral_4">[AppGeneral_4]</a>
Los contratos inteligentes sólo podrán ser modificados por la DAO.

<a name="AppGeneral_5">[AppGeneral_5]</a>
La dirección de los contractos inteligentes se resolverá con el nombre de [Ethereum Name Service](https://ens.domains/) **humanityunchaineddao.eth**.


### Sistema de Gestión de Identidad

<a name="Identity_1">[Identity_1]</a>
La aplicación permitirá a los miembros crear y gestionar su identidad digital.

<a name="Identity_2">[Identity_2]</a>
The Sistema de Gestión de Identidad será a prueba de ataques sybil.

<a name="Identity_3">[Identity_3]</a>
Será posible integrar otros sistemas de identidad.

<a name="Identity_4">[Identity_4]</a>
Los miembros podrán elegir si su identidad HUD es anónima o no.

<a name="Identity_5">[Identity_5]</a>
Los miembros podrán registrar una identidad HUD no anónima y una identidad HUD anónima.

<a name="Identity_6">[Identity_6]</a>
La aplicación permitirá utilizar [Proof of Humanity](https://proofofhumanity.id/) como sistema de gestión de identidad no anónima. Se creará un sistema de oráculo para sincronizar el contrato inteligente Proof of Humanity en la red principal de Ethereum con la cadena Polygon.

<a name="Identity_7">[Identity_7]</a>
La aplicación permitirá utilizar el badge [SISMO](https://sismo.io) de [Proof of Humanity](https://proofofhumanity.id/) como sistema de gestión de identidad anónima.

<a name="Identity_8">[Identity_8]</a>
EL metadata de las identidades se almacenará en [IPFS](https://en.wikipedia.org/wiki/InterPlanetary_File_System).

<a name="Identity_9">[Identity_9]</a>
El acceso IPFS por defecto será [nftstorage.link](https://nftstorage.link).


### Asamblea

#### Miembros

<a name="Members_1">[Members_1]</a>
Todos los miembros de la DAO deben poseer un registro válido en el Sistema de Gestión de Identidades.

<a name="Members_2">[Members_2]</a>
Para hacerse miembros, los solicitantes firmarán con su monedero la promesa de respetar la [constitución](./constitution/CONSTITUTION) y las versiones actuales y futuras de las Normas Adicionales durante el tiempo que dure su membresía.


<a name="Members_3">[Members_3]</a>
Los miembros podrán darse de baja en cualquier momento.



#### Delegados

<a name="Delegates_1">[Delegates_1]</a>
Los miembros podrán designar a un delegado, el cual emitirá los votos en nombre de los miembros.

<a name="Delegates_2">[Delegates_2]</a>
Los delegados no necesirán ser miembros.

#### Escaños


<a name="Seats_1">[Seats_1]</a>
Habrá 20 escaños.

<a name="Seats_2">[Seats_2]</a>
Los delegados con el mayor número de miembros designados podrán ocupar un escaño.

<a name="Seats_3">[Seats_3]</a>
Los delegados ocupando un escaño podrán ser recompensados en tokens HUD y proporcionalmente al número de ciudadanos que los designen.


### Votaciones

#### General


<a name="Voting_1">[Voting_1]</a>
La forma de contar los votos será 1-humano-1-voto.

<a name="Voting_2">[Voting_2]</a>
Habrá dos tipos de votos: votos de los miembros y votos de los delegados.

<a name="Voting_3">[Voting_3]</a>
El signo del voto puede ser "Sí", "No" y "En Blanco".

<a name="Voting_4">[Voting_4]</a>
Las votaciones sobre propuestas que requieran transacciones en la cadena se realizarán en la cadena.

<a name="Voting_5">[Voting_5]</a>
Las direcciones sospechas no podrán votar.


#### Fuera de la cadena

<a name="OffChainVoting_1">[OffChainVoting_1]</a>
Se podrán realizar votaciones fuera de la cadena en [Snapshot](snapshot.org).


#### En la cadena

<a name="OnChainVoting_1">[OnChainVoting_1]</a>
La aplicación implementará un sistema de votación en la cadena que permita a los miembros de la DAO interactuar colectivamente con cualquier contrato inteligente que se ejecute en la misma cadena. El sistema soportará la presentación de propuestas que contengan transacciones que se ejecutarán si la mayoría de los miembros así lo aprueba.

<a name="OnChainVoting_2">[OnChainVoting_2]</a>
Cualquiera, excepto las direcciones sospechosas, podrá presentar propuestas.

<a name="OnChainVoting_3">[OnChainVoting_3]</a>
Las propuestas podrán contener cualquier número de transacciones.

<a name="OnChainVoting_4">[OnChainVoting_4]</a>
Deberá ser posible adjuntar metadatos a las propuestas y transacciones.

<a name="OnChainVoting_5">[OnChainVoting_5]</a>
Sólo los miembros podrán crear votaciones sobre las propuestas.

<a name="OnChainVoting_6">[OnChainVoting_6]</a>
La creación de votaciones presentadas será gratuita.

<a name="OnChainVoting_7">[OnChainVoting_7]</a>
Votación de los delegados: La propuesta será aprobada por los delegados de la DAO si la suma de todos los votos delegados de los delegados sentados que votaron "sí" es mayor que el número total de miembros delegados por los delegados sentados multiplicado por un umbral determinado.

<a name="OnChainVoting_8">[OnChainVoting_8]</a>
Votación de los miembros: La propuesta será aprobada o rechazada si el número de votos de los miembros a favor del "sí" o el número de votos de los miembros en contra del "no", respectivamente, es mayor que el número total de miembros multiplicado por un umbral determinado.

<a name="OnChainVoting_9">[OnChainVoting_9]</a>
Si los resultados de la votación de los delegados y de la votación de los miembros están en conflicto (por ejemplo, los delegados aprueban y los miembros no aprueban, o viceversa), la votación de los miembros siempre prevalece sobre la de los delegados.

<a name="OnChainVoting_10">[OnChainVoting_10]</a>
La DAO puede establecer el valor de los umbrales de votación, que por defecto serán del 50%.

<a name="OnChainVoting_11">[OnChainVoting_11]</a>
Las transacciones de las propuestas aprobadas podrán ser ejecutadas por cualquiera.

<a name="OnChainVoting_12">[OnChainVoting_12]</a>
Los ejecutores de las transacciones podrán ser recompensados con tokens HUD.

<a name="OnChainVoting_13">[OnChainVoting_13]</a>
Los delegados con escaño que se hayan abstenido de votar en la última votación serán sospechosos. Los miembros que se hayan abstenido de votar en las dos últimas votaciones y no hayan nombrado a un delegado serán sospechosos.

<a name="OnChainVoting_14">[OnChainVoting_14]</a>
Las votaciones comenzarán el lunes a las 00:00 CET y finalizarán el sábado a las 23:59 CET de la misma semana.


#### Quórum

<a name="Quorum_1">[Quorum_1]</a>
Se necesitará un número mínimo de miembros registrados (deminado *Quórum de Miembros*) para que una propuesta se ejecute si es aprobada. Hasta que se alcance el Quórum, sólo la Madrina podrá ejecutar las propuestas aprobadas.

<a name="Guidemother_2">[Guidemother_2]</a>
El quórum será de al menos 1000 miembros.

### Madrina

<a name="Guidemother_1">[Guidemother_1]</a>
Hasta que se haya alcanzado el quórum, la madrina podrá modificar o volver a desplegar los contratos inteligentes, pero con el único fin de corregir fallos o para reducir el número necesario de miembros del quórum.

<a name="Guidemother_2">[Guidemother_2]</a>
La madrina se retirá automáticamente una vez que se haya alcanzado el quórum.


### Monedero


<a name="Wallet_1">[Wallet_1]</a>
La DAO poseerá un monedero para almacenar cualquier tipo de token en la cadena.

<a name="Wallet_2">[Wallet_2]</a>
Las transferencias fuera del monedero sólo serán posibles a través de una votación en la cadena aprobada por la DAO.

### Token
<a name="Token_1">[Token_1]</a>
La DAO tendrá un token fungible, que se llamará *Token HUD*.

<a name="Token_2">[Token_2]</a>
El token implementará el [estándar ERC-777](https://eips.ethereum.org/EIPS/eip-777).

<a name="Token_3">[Token_3]</a>
Símbolo: HUD
Nombre: Humanity Unchained DAO
Decimales: 18

<a name="Token_4">[Token_4]</a>
[Token_XXX] El suministro total inicial será de 1 billón de tokens.

<a name="Token_5">[Token_5]</a>
La DAO poseerá una reserva de tokens.

<a name="Token_6">[Token_6]</a>
La DAO tendrá el control total del token, como la capacidad de acuñar, quemar y transferir forzosamente tokens, y de impedir que determinadas direcciones reciban o envíen tokens.

### Emblemas

Nota: En esta sección, el término "DAO" se utiliza para referirse tanto a la organización en general como a cualquier contrato inteligente de la applicación.

<a name="Emblems_1">[Emblems_1]</a>
La aplicación implementará un tipo especial de token no fungible, llamado Emblema, que proporciona a la DAO una forma flexible de construir y gestionar estructuras organizativas.

<a name="Emblems_2">[Emblems_2]</a>
La implementación de Emblems seguirá el [Estándar Multi Token ERC-1155](https://eips.ethereum.org/EIPS/eip-1155).

<a name="Emblems_3">[Emblems_3]</a>
Cualquiera podrá crear un emblema.

<a name="Emblems_4">[Emblems_4]</a>
El creador del emblema tendrá por defecto el rol de administrador del emblema. Dicho rol podrá ser transferido a otra dirección por parte de la DAO y del propio administrador.

<a name="Emblems_5">[Emblems_5]</a>
El URI del emblema, donde se almacenan los metadatos del token, sólo podrá ser modificado por la DAO. Si el administrador o los poseedores del emblema desean cambiar el URI, se presentará una propuesta a la DAO para su votación en la cadena.

<a name="Emblems_6">[Emblems_6]</a> 
La DAO o el administrador del emblema podrán establecer un depósito obligatorio en tokens HUD necesario para poseer el emblema. Las direcciones que no depositen dicha cantidad no podrán recibir tokens del emblema. Si la dirección ya posee tokens, el dueño no podrá hacer uso de los tokens hasta que deposite la cantidad completa requerida.

<a name="Emblems_7">[Emblems_7]</a> 
Los emblemas podrán ser intransferibles (también llamados *soulbound*), lo que significa que el propietario no podrán transferirlos a otra dirección, a menos que el propietario sea el administrador del emblema o la DAO. Esta característica se establece al crear el emblema y sólo la DAO puede cambiarla.

<a name="Emblems_8">[Emblems_8]</a>
Los emblemas podrán configurarse de manera que cada dirección no se pueda poseer más de un token, excepto para el administrador del emblema o la DAO. Esta característica se establece al crear el emblema y sólo la DAO puede cambiarla.

<a name="Emblems_9">[Emblems_9]</a>
La DAO y el admin podrán transferir forzosamente tokens de emblemas desde cualquier dirección excepto desde las de la DAO. Esto incluye quemar tokens (que efectivamente equivale a transferirlos a la dirección cero).

<a name="Emblems_10">[Emblems_10]</a> 
Los emblemas podrán ser *verificados*, lo que significa que están legitimados por la DAO. La DAO podrá verificar un emblema a través de una votación en la cadena. Los emblemas creados por la DAO serán verificados por defecto.

<a name="Emblems_11">[Emblems_11]</a>
La DAO podrá cobrar por la creación de nuevos emblemas, así como por la acuñación de tokens de un emblema concreto, en tokens HUD. La DAO no pagará ninguna tasa por la creación o acuñación de tokens de emblema.

<a name="Emblems_12">[Emblems_12]</a>
Los miembros, delegados y escaños de la DAO se serán emblemas cuyo administrador es la DAO, serán intransferibles y cada dirección sólo puede poseer un token.

<a name="Emblems_13">[Emblems_13]</a>
La tasa de acuñación de tokens y el depósito requerido del emblema de membresía o serán cero.

<a name="Emblems_14">[Emblems_14]</a>
La tasa de acuñación de tokens del emblema de delegación será cero. El depósito requerido será de 100 tokens HUD.

<a name="Emblems_15">[Emblems_15]</a>
La tasa de acuñación de tokens del emblema de escaños será cero. El depósito requerido será de 200 tokens HUD.

<a name="Emblems_16">[Emblems_16]</a>
La DAO tendrá pleno control de los tokens emblema, como la capacidad de acuñar, quemar y transferir forzosamente tokens, y de impedir que determinadas direcciones reciban o envíen tokens.


#### Clusters

<a name="Clusters_1">[Clusters_1]</a>
Se denominará  cluster a un tipo especial de emblemas que está vinculados a uno o más territorios. Las coordenadas espaciales de los territorios se almacenarán como parte de los metadatos del token.

<a name="Referral_2">[Referral_2]</a>
Los territorios de los clusters se representarán gráficamente en un mapa en la aplicación.

### Programa de refereridos

<a name="Referral_1">[Referral_1]</a>
Cada nuevo miembro registrado podrá optar a una recompensa por referido de 50 tokens HUD.

<a name="Referral_2">[Referral_2]</a>
Los miembros que traigan nuevos miembros a la DAO serán recompensados con 50 tokens HUD por cada nuevo miembro referido.

### Infracción de las normas

<a name="Distrust_1">[Distrust_1]</a>
La Aplicación proporcionará un modo para que la DAO mantenga un registro de los miembros expulsados.

<a name="Distrust_2">[Distrust_2]</a>
La Aplicación proporcionará una manera para que la DAO mantenga un registro de las direcciones que han sido amonestadas por infringir cualquier regla. Dichas direcciones se denominarán "sospechosas".

<a name="Distrust_3">[Distrust_3]</a>
La DAO podrá establecer que direcciones son sospechosas a través de una votación en la cadena.

<a name="Distrust_4">[Distrust_4]</a>
La DAO podrá desconfiar de direcciones por cualquier razón que considere apropiada.

<a name="Distrust_5">[Distrust_5]</a>
Para que un miembro sea expulsado, su dirección deberá ser sospechosa primero.

<a name="Distrust_6">[Distrust_6]</a>
Las direcciones sospechosas pueden ser devueltas por la DAO a través de una votación en la cadena.

<a name="Emblems_7">[Emblems_7]</a>
Las direcciones sospechosas no podrán recibir o enviar tokens HUD o emblemas.

<a name="Distrust_8">[Distrust_8]</a>
Las direcciones sospechosas no podrán convertirse en miembros o delegados.

<a name="Distrust_9">[Distrust_9]</a>
Los delegados sospechosos no podrán reclamar un escaño. Los delegados sospechosos con asiento pueden conservarlo.

<a name="Distrust_10">[Distrust_10]</a>
Las direcciones sospechosas no podrán presentar propuestas ni iniciar votaciones.

<a name="Distrust_11">[Distrust_11]</a>
Los delegados con asiento serán automáticamente sospechosos si se abstienen de votar en la última votación en cadena.

<a name="Distrust_12">[Distrust_12]</a>
Los miembros serán automáticamente sospechosos si se abstienen en las dos últimas votaciones en cadena y no tienen delegado designado.

<a name="Distrust_13">[Distrust_13]</a>
Las direcciones sospechosas no podrán ser administradores de emblemas.


## Gestión de servicios fuera de la cadena

<a name="Community_1">[Community_1]</a>
La DAO designará miembros que se encargarán de gestionar los servicios fuera de la cadena mediante la creación y transferencia de emblemas creados para tal fin. Dichos emblemas se denominarán *emblemas de administrador*.

<a name="Community_2">[Community_2]</a>
Se creará un emblema de administrador para cada uno de los siguientes servicios externos:

Dominios y servidores web
Telegram
Twitter
Github
Foro
ENS

<a name="Community_3">[Community_3]</a>
Los emblemas de administrador sólo podrán ser transferidos por la DAO.

<a name="Community_4">[Community_4]</a>
Un miembro sólo podrá tener un emblema de administrador por cada servicio fuera de la cadena.

<a name="Community_5">[Community_5]</a>
Se necesitará un depósito de 1000 tokens HUD para poseer un emblema de administrador.

<a name="Community_6">[Community_6]</a>
Los poseedores del emblema no podrán ser miembros sospechosos.

<a name="Community_7">[Community_7]</a>
La Madrina entregará las credenciales de cualquier servicio fuera de la cadena que ella posea a los titulares de emblemas correspondientes antes de que se alcance el Quórum.

## Procedimiento de modificación de las normas adicionales

<a name="AdditionalRules_1">[AdditionalRules_XXX]</a>
El documento de Reglas Adicionales será controlado por versiones.

<a name="AdditionalRules_2">[AdditionalRules_XXX]</a>
Las nuevas versiones del documento de Reglas Adicionales entrarán efectivamente en vigor una vez que el contrato inteligente DAO se actualice a través de una votación en la cadena con la referencia (por ejemplo, un URI) al nuevo documento de Reglas Adicionales.