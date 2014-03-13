<?

$Word = $_GET["word"];
$Language = $_GET["lang"];

//$Word = str_replace( "%20" , " " , $tempWord );

$voice = file_get_contents( 'http://translate.google.com/translate_tts?tl='.$Language.'&q='.urlencode($Word) ); 

echo $voice;
?>