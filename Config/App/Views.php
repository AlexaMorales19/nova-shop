<?php
class Views{
 
    public function getView($ruta, $vista, $data="")
    {
        if ($ruta == "home") {
            $vista = $vista.".php";
        }else{
            $vista = "Views/".$ruta."/".$vista.".php";
        }
        require $vista;
    }
}
?>
