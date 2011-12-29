# fNordLager

Das fNordLager ist ein CLI zum Verwalten unserer Waren.


## Infos
Es gibt keine Datenbank, die Daten werden als JSON de-/serialisiert und auf der Platte abgelegt.

Damit das Lager läuft benötigt man nichts weiter ausser NodeJs


## HowTo

Es gibt fünf Modi


    Command Add Sell Load Show


Der Command Modus ist der Startmodus.


Im Add Modus können Bestände hinzugefügt werden.


Im Sell Modus können Dinge aus dem Bestand entfernt werden.


Im Load Modus kann man sein Guthaben aufladen.


Im Show Modus kann man sich ein Thing ausgeben lassen.


### Beispiel Einkauf (Wareneingang)
    $[Command]> set mode Add

    $[Add]> 1234
    { name: 'Club-Mate', quantity: 1, barcode: '1234', price: '1.5' }

    $[Add]> 23 1234
    { name: 'Club-Mate', quantity: 24, barcode: '1234', price: '1.5' }

    $[Add]> exit

    $[Command]>

### Beispiel Verkauf (Warenausgang)
    $[Command]> set user vileda

    $[Command(vileda)]> set mode Sell

    $[Sell(vileda)]> 1234
    { name: 'Club-Mate', quantity: 0, barcode: '1234', price: '1.5' }
    { name: 'vileda', balance: 98.5, member: true }

    $[Sell(vileda)]> exit

    $[Command]>

### Beispiel Guthabenaufladung
    $[Command]> set mode Load

    $[Load]> vileda 13.37
    { name: 'vileda', balance: 111.87, member: true }

    $[Load(vileda)]> exit

    $[Command]>

### Beispiel Show
    $[Command]> set mode Show

    $[Show]> 1234
    { name: 'Club-Mate', quantity: 0, barcode: '1234', price: '1.5' }

    $[Show]> exit

    $[Command]>