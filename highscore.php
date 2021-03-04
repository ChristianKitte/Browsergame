<table id="highscore_table">

    <tr>
        <th>Platz</th>
        <th>Spieler</th>
        <th>Punktzahl</th>
    </tr>

    <?php
    if ($file = fopen('highscore.dat', 'r')) {
        while (($data = fgetcsv($file, 1000, ",")) !== FALSE) {
            echo "<tr>\n";
            echo "<td>" . $data[0] . "</td>\n";
            echo "<td>" . $data[1] . "</td>\n";
            echo "<td>" . $data[2] . "</td>\n";
            echo "</tr>\n";
        }
        fclose($file);
    } else {
        die("Unable to open the file");
    }
    ?>

</table>
