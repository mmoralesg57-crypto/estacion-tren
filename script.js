// Base de datos transaccional de boletos en localStorage (Persistente para el administrador)
let BD_PASAJEROS = JSON.parse(localStorage.getItem('bd_tren')) || [];

// La base de datos volatil: Se vacía por completo al cerrar la pestaña
let BD_USUARIOS = JSON.parse(sessionStorage.getItem('bd_usuarios_sistema')) || [];
let usuarioLogueadoActual = null;
const formViajero = document.getElementById('form-viajero');
const formEncuesta = document.getElementById('form-encuesta');
const formCrearUser = document.getElementById('form-crear-usuario');
const formIngresoUser = document.getElementById('form-ingreso-usuario');
let pasajeroActual = {};
let costorutaGlobal = 0;
let extraCafe = 0;
let extraPase = 0;
let textoRutaElegida = "";

// control de navegacion: la bienvenida, cada paso de acceso obligatorio
document.getElementById('btn-comenzar').addEventListener('click', () => {
document.getElementById('section-bienvenida').classList.add('hidden');
document.getElementById('section-usuario-auth').classList.remove('hidden');
});
document.getElementById('btn-volver-auth-inicio').addEventListener('click', () => {
document.getElementById('section-usuario-auth').classList.add('hidden');
document.getElementById('section-bienvenida').classList.remove('hidden');
});
document.getElementById('btn-volver-bienvenida').addEventListener('click', () => {
document.getElementById('section-registro').classList.add('hidden');
document.getElementById('section-bienvenida').classList.remove('hidden');
usuarioLogueadoActual = null;
});

// evento de control: registro para un nuevo pasajero en la memoria volatil 
formCrearUser.addEventListener('submit', function(e) {
e.preventDefault();
const nombre = document.getElementById('reg-nombre').value.trim();
const correo = document.getElementById('reg-correo').value.trim().toLowerCase();
const telefono = document.getElementById('reg-telefono').value.trim();
const correoDuplicado = BD_USUARIOS.some(user => user.correo === correo);
if (correoDuplicado) {
alert("⚠️ Este correo electrónico ya se encuentra registrado en el sistema.");
return;
}
BD_USUARIOS.push({ nombre, correo, telefono });
sessionStorage.setItem('bd_usuarios_sistema', JSON.stringify(BD_USUARIOS));
alert("🎉 Usuario registrado exitosamente. Ya puede ingresar en el panel de la derecha.");
formCrearUser.reset();
});

// Evento de control: para la calidacion de inicio de sesion a los pasajeros
formIngresoUser.addEventListener('submit', function(e) {
e.preventDefault();
const correo = document.getElementById('login-correo-user').value.trim().toLowerCase();
const usuarioEncontrado = BD_USUARIOS.find(user => user.correo === correo);
if (usuarioEncontrado) {
usuarioLogueadoActual = usuarioEncontrado;
alert(`🚄 ¡Acceso concedido! Bienvenido de vuelta, ${usuarioEncontrado.nombre}.`);        
        
// Se va cargando el nombre del fomulario principal y congela el inputl
document.getElementById('nombre').value = usuarioEncontrado.nombre;
document.getElementById('nombre').readOnly = true;
document.getElementById('section-usuario-auth').classList.add('hidden');
document.getElementById('section-registro').classList.remove('hidden');
formIngresoUser.reset();
} else {
alert("❌ El correo ingresado no coincide con ningún usuario registrado.");
}
});

// interactividad de los anuncios (el calculo de tiempo real del monetario)
document.getElementById('btn-add-cafe').addEventListener('click', function() {
const btn = this;
if (extraCafe === 0) {
extraCafe = 15.50;
btn.innerText = "✓ Incluido (Q15.50)";
btn.classList.add('btn-active-ad');
alert("☕ ¡Vagón Cafetería agregado con éxito a su itinerario!");
} else {
extraCafe = 0;
btn.innerText = "🛒 Agregar (+Q15.50)";
btn.classList.remove('btn-active-ad');
}
});

document.getElementById('btn-add-pase').addEventListener('click', function() {
const btn = this;
if (extraPase === 0) {
extraPase = 40.00;
btn.innerText = "✓ Incluido (Q40.00)";
btn.classList.add('btn-active-ad');
alert("🎫 ¡Pase Frecuente Oro VIP agregado con éxito a su itinerario!");
} else {
extraPase = 0;
btn.innerText = "🛒 Agregar (+Q40.00)";
btn.classList.remove('btn-active-ad');
}
});

// El proceso del formulario de viaje y el control del dpi repetido
formViajero.addEventListener('submit', function(e) {
e.preventDefault();
const nombre = document.getElementById('nombre').value.trim();
const documento = document.getElementById('documento').value.trim();
const rutaSelect = document.getElementById('ruta');
costorutaGlobal = parseFloat(rutaSelect.value);
textoRutaElegida = rutaSelect.options[rutaSelect.selectedIndex].text;
const documentoDuplicado = BD_PASAJEROS.some(pasajero => pasajero.documento === documento);
if (documentoDuplicado) {
alert("⚠️ ADVERTENCIA: Este Documento de Identidad ya está registrado a nombre de otro viajero.");
return;
}
const ahora = new Date();
const horaSalida = ahora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
ahora.setHours(ahora.getHours() + 2);
const horaLlegada = ahora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

// La limpieza de los estados visuales, los anuncios para el boleto actual
extraCafe = 0;
extraPase = 0;
const b1 = document.getElementById('btn-add-cafe');
const b2 = document.getElementById('btn-add-pase');
b1.innerText = "🛒 Agregar (+Q15.50)"; b1.classList.remove('btn-active-ad');
b2.innerText = "🛒 Agregar (+Q40.00)"; b2.classList.remove('btn-active-ad');
pasajeroActual = { nombre, documento, rutaText: textoRutaElegida, horaSalida, horaLlegada };
document.getElementById('lbl-nombre').innerText = nombre;
document.getElementById('lbl-documento').innerText = documento;
document.getElementById('lbl-ruta').innerText = textoRutaElegida;
document.getElementById('lbl-salida').innerText = horaSalida;
document.getElementById('lbl-llegada').innerText = horaLlegada;
document.getElementById('section-registro').classList.add('hidden');
document.querySelector('.contenedor-boleto-global').classList.remove('hidden');
});
document.getElementById('btn-ir-encuesta').addEventListener('click', () => {
document.querySelector('.contenedor-boleto-global').classList.add('hidden');
document.getElementById('section-encuesta').classList.remove('hidden');
});

// El proceso de la encuenta, el total final y el reporte quetzal
formEncuesta.addEventListener('submit', function(e) {
e.preventDefault();
const p1 = document.querySelector('input[name="p1"]:checked').value;
const p2Checkboxes = document.querySelectorAll('input[name="p2"]:checked');
let p2Valores = [];
p2Checkboxes.forEach(cb => p2Valores.push(cb.value));

const p3 = document.querySelector('select[name="p3"]').value;
const p4 = document.querySelector('input[name="p4"]:checked').value;
const p5 = document.querySelector('input[name="p5"]:checked') ? "Sí" : "No";
const p6 = document.querySelector('select[name="p6"]').value;
const totalExtras = extraCafe + extraPase;
const totalPagoFinal = costorutaGlobal + totalExtras;

const registroCompleto = {
...pasajeroActual,
p1, p2: p2Valores.join(', '), p3, p4, p5, p6,
costoBase: costorutaGlobal,
costoAdicional: totalExtras,
totalNeto: totalPagoFinal
};
BD_PASAJEROS.push(registroCompleto);
localStorage.setItem('bd_tren', JSON.stringify(BD_PASAJEROS));

document.getElementById('dip-nombre').innerText = pasajeroActual.nombre;
document.getElementById('bill-ruta').innerText = `Q${costorutaGlobal.toFixed(2)}`;
document.getElementById('bill-extra').innerText = `Q${totalExtras.toFixed(2)}`;
document.getElementById('bill-total').innerText = `Q${totalPagoFinal.toFixed(2)}`;
document.getElementById('section-encuesta').classList.add('hidden');
document.getElementById('section-resultado').classList.remove('hidden');
});

// El inicio de sesion de la administracion con los credenciales inteligentes
const modalLogin = document.getElementById('modal-login');
const btnLoginModal = document.getElementById('btn-login-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnSubmitLogin = document.getElementById('btn-submit-login');
const sectionAdmin = document.getElementById('section-admin');

const txtUser = document.getElementById('login-user');
const txtPass = document.getElementById('login-pass');
const chkRecordar = document.getElementById('chk-recordar');
const wrapperOlvidar = document.getElementById('wrapper-olvidar');
const lnkOlvidar = document.getElementById('lnk-olvidar');

function verificarCredencialesGuardadas() {
const guardadoUser = localStorage.getItem('admin_remember_user');
const guardadoPass = localStorage.getItem('admin_remember_pass');

if (guardadoUser && guardadoPass) {
txtUser.value = guardadoUser;
txtPass.value = guardadoPass;
chkRecordar.checked = true;
wrapperOlvidar.classList.remove('hidden');
} else {
txtUser.value = "";
txtPass.value = "";
chkRecordar.checked = false;
wrapperOlvidar.classList.add('hidden');
}
}

btnLoginModal.addEventListener('click', () => {
verificarCredencialesGuardadas();
modalLogin.classList.remove('hidden');
});

btnCloseModal.addEventListener('click', () => modalLogin.classList.add('hidden'));

document.getElementById('form-submit-login').addEventListener('submit', (e) => {
e.preventDefault();
const user = txtUser.value;
const pass = txtPass.value;

if (user === "admin" && pass === "2026") {
if (chkRecordar.checked) {
localStorage.setItem('admin_remember_user', user);
localStorage.setItem('admin_remember_pass', pass);
} else {
localStorage.removeItem('admin_remember_user');
localStorage.removeItem('admin_remember_pass');
}
modalLogin.classList.add('hidden');
ocultarTodasLasSecciones();
sectionAdmin.classList.remove('hidden');
cargarTablaAdmin();
} else {
alert("❌ Credenciales incorrectas. Intente de nuevo.");
}
});

lnkOlvidar.addEventListener('click', (e) => {
e.preventDefault();
localStorage.removeItem('admin_remember_user');
localStorage.removeItem('admin_remember_pass');
alert("🗑️ Se han borrado las credenciales guardadas de este equipo.");
verificarCredencialesGuardadas();
});

function ocultarTodasLasSecciones() {
document.getElementById('section-bienvenida').classList.add('hidden');
document.getElementById('section-usuario-auth').classList.add('hidden');
document.getElementById('section-registro').classList.add('hidden');
document.getElementById('section-encuesta').classList.add('hidden');
document.getElementById('section-resultado').classList.add('hidden');
document.querySelector('.contenedor-boleto-global').classList.add('hidden');
}

function cargarTablaAdmin() {
const tbody = document.querySelector('#tabla-registros tbody');
tbody.innerHTML = "";

BD_PASAJEROS.forEach(item => {
const row = document.createElement('tr');
row.innerHTML = `
<td>${item.nombre}</td>
<td>${item.documento}</td>
<td>Q${(item.costoBase || 0).toFixed(2)}</td>
<td>Q${(item.costoAdicional || 0).toFixed(2)}</td>
<td style="font-weight:bold; color:#e74c3c;">Q${(item.totalNeto || 0).toFixed(2)}</td>`;
tbody.appendChild(row);
});
}

document.getElementById('btn-limpiar-bd').addEventListener('click', () => {
if (confirm("⚠️ ¿Está seguro de que desea eliminar todos los registros históricos?")) {
localStorage.removeItem('bd_tren');
BD_PASAJEROS = [];
cargarTablaAdmin();
alert("🗑️ Base de datos limpiada con éxito.");
}
});

document.getElementById('btn-salir-admin').addEventListener('click', () => {
sectionAdmin.classList.add('hidden');
document.getElementById('section-bienvenida').classList.remove('hidden');
formViajero.reset();
document.getElementById('nombre').value = "";
document.getElementById('nombre').readOnly = false;
usuarioLogueadoActual = null;
});

// El reinicio para otro pasajero (para la limpieza y desbloqueo)
document.getElementById('btn-volver-inicio').addEventListener('click', () => {
document.getElementById('section-resultado').classList.add('hidden');
document.getElementById('section-bienvenida').classList.remove('hidden');
formViajero.reset();
formEncuesta.reset();
document.getElementById('nombre').value = "";
document.getElementById('nombre').readOnly = false;
usuarioLogueadoActual = null;
});