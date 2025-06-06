const tableLista = document.querySelector('#tableListaProductos tbody');
const tblPendientes = document.querySelector('#tblPendientes');
let productosjson = [];
const estadoEnviado = document.querySelector('#estadoEnviado');
const estadoProceso = document.querySelector('#estadoProceso');
const estadoCompletado = document.querySelector('#estadoCompletado');
document.addEventListener('DOMContentLoaded', function(){
    if (tableLista) {
        getListaProductos();
    }
    //cargar datos pendientes con DataTables
    $('#tblPendientes').DataTable( {
    ajax: {
        url: base_url + 'clientes/listarPendientes',
        dataSrc: ''
    },
    columns: [
        { data: 'id_transaccion' },
        { data: 'monto' },
        { data: 'fecha' },
        { data: 'accion' }
    ],
    language: {
            url: base_url + 'assets/js/es-MX.json'
    },
    dom,
    buttons
    } );
    
})

function getListaProductos() {
    let html = '';
    const url = base_url + 'principal/listaProductos';
    const http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.send(JSON.stringify(listaCarrito));
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            if (res.totalPaypal > 0) {
                res.productos.forEach(producto => {
                html += `<tr>
                    <td>
                    <img class="img-thumbnail rounded-circle" src="${producto.imagen}" alt="" width="100">                    
                    </td>
                    <td>${producto.nombre}</td>
                    <td><span class="badge bg-info">${res.moneda + ' ' + producto.precio}</span></td>
                    <td><span class="badge bg-primary">${producto.cantidad}</span></td>
                    <td>${producto.subTotal}</td>
                    </tr>`;
                //agregar los productos en pago paypal
                    let json = {
                        "name": producto.nombre,
                        "unit_amount":{
                            "currency_code": res.moneda,
                            "value": producto.precio
                        },
                        "quantity": producto.cantidad
                    }
                    productosjson.push(json)

                });
                tableLista.innerHTML = html;
                document.querySelector('#totalPorducto').textContent = 'Total a pagar: ' + res.moneda + ' ' +  res.total;
                botonPaypal(res.totalPaypal, res.moneda);
            }else{
                tableLista.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">CARRITO VACIO</td>
                </tr>
                `;
            }
            
            
        }
    }
}

function botonPaypal(total, moneda) {
    // Render the PayPal button into #paypal-button-container
    paypal.Buttons({

        // Call your server to set up the transaction
        createOrder: (data, actions) => {
	        return actions.order.create({
	            "purchase_units": [{
	                "amount": {
	                    "currency_code": moneda,
	                    "value": total,
	                    "breakdown": {
	                        "item_total": {
	                            "currency_code": moneda,
	                            "value": total
	                        }
                        }
                    },
	                "items": productosjson
                }]
            });
        },
	

        // Call your server to finalize the transaction
        onApprove: (data, actions) => {
            return actions.order.capture().then(function(orderData) {
                registrarPedido(orderData)
            });
        }

    }).render('#paypal-button-container');
}

function registrarPedido(datos) {
    const url = base_url + 'clientes/registrarPedido';
    const http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.send(JSON.stringify({
        pedidos: datos,
        productos: listaCarrito
    }));
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            const res = JSON.parse(this.responseText);
            Swal.fire("REGISTRO", res.msg, res.icono );
            if (res.icono == 'success') {
                localStorage.removeItem('listaCarrito');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } 
        }
    }
}

function verPedido(idPedido) {
    estadoEnviado.classList.remove('services-icon-wap');
    estadoProceso.classList.remove('services-icon-wap');
    estadoCompletado.classList.remove('services-icon-wap');
    const mPedido = new bootstrap.Modal(document.getElementById('modalPedido'));
    const url = base_url + 'clientes/verPedido/' + idPedido;
    const http = new XMLHttpRequest();
    http.open('GET', url, true);
    http.send();
    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const res = JSON.parse(this.responseText);
            let html = '';
            if (res.pedido.proceso == 1) {
                estadoEnviado.classList.add('services-icon-wap');
            } else if(res.pedido.proceso == 2) {
                estadoProceso.classList.add('services-icon-wap');
            }else{
                estadoCompletado.classList.add('services-icon-wap');
            }
            res.productos.forEach(row => {
                let subTotal = parseFloat(row.precio) * parseInt(row.cantidad)
                html += `<tr>
                    <td>${row.producto}</td>
                    <td><span class="badge bg-info">${res.moneda + ' ' + row.precio}</span></td>
                    <td><span class="badge bg-primary">${row.cantidad}</span></td>
                    <td>${subTotal.toFixed(2)}</td>
                </tr>`;
            });
            document.querySelector('#tablePedidos tbody').innerHTML = html;
            mPedido.show();
        }
    }
    
}