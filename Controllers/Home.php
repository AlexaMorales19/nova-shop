<?php
class Home extends Controller
{
    public function __construct() {
        parent::__construct();
        session_start();
    }
    public function index()
    {
        $data['perfil'] = 'no';
        $data['title'] = 'Pagina Principal';
        $data['categorias'] = $this->model->getCategorias();
        $data['nuevosProductos'] = $this->model->getNuevoProductos();
        $this->views->getView('home', "indexh", $data);
    }
    
}
