<?php

//https://php.net/manual/en/function.is-integer.php
//https://www.php.net/manual/en/function.htmlentities.php
//https://www.php.net/manual/en/function.strip-tags.php
//https://www.php.net/manual/en/function.stripslashes.php

//https://www.w3schools.com/php/php_file.asp
//https://www.w3schools.com/php/php_arrays.asp

$name = sanitizeString($_GET['name']);
$points = sanitizeString($_GET['points']);

$entries = [];
$max_number = 5;

$file_name = 'highscore.dat';

if (trim($name) != "" && $points>0) {

    if ($file = fopen($file_name, 'r')) {
        while (($data = fgetcsv($file, 1000, ",")) !== FALSE) {
            $entries[$data[1]] = $data[2];
        }
        fclose($file);

        $entries[$name] = $points;
        arsort($entries);

        $tmp = [];
        $counter = 1;
        foreach ($entries as $x => $x_value) {
            if ($counter <= $max_number)
                $tmp[$x] = $x_value;
            $counter++;
        }

        $counter = 1;
        if ($file = fopen($file_name, 'w')) {
            foreach ($tmp as $x => $x_value) {
                //confirm to use " instead of ' ! Need to proceed \n!
                fwrite($file, $counter . "," . $x . "," . $x_value . "\n");
                $counter++;
            }

            fclose($file);
        } else {
            die("Unable to open the file");
            echo "Der Highscore konnte nicht aktualisiert werden!";
        }

        //echo "Der Highscore wurde aktualisiert !";
    } else {
        die("Unable to open the file");
        echo "Der Highscore konnte nicht aktualisiert werden!";
    }
}

function sanitizeString($var)
{
    $var = stripslashes($var);
    $var = strip_tags($var);
    $var = htmlentities($var);

    return $var;
}
?>