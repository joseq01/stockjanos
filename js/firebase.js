// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBS2yswfrDzyOzlP2aJRkws8sX8930DvYY",
  authDomain: "stock-janos.firebaseapp.com",
  projectId: "stock-janos",
  storageBucket: "stock-janos.firebasestorage.app",
  messagingSenderId: "656905318444",
  appId: "1:656905318444:web:90fd9780bb9f3c424ba189",
  measurementId: "G-DGXEE6YHFX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const db = getFirestore(app);

// Función para cargar salones
export async function cargarSalones() {
  const datalist = document.getElementById("listaSalones");
  datalist.innerHTML = "";

  const snapshot = await getDocs(collection(db, "salones"));
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.salones) {
      const option = document.createElement("option");
      option.value = data.salones;
      datalist.appendChild(option);
    }
  });
}

// Función para cargar stock
export async function cargarStockActual() {
  const salon = localStorage.getItem("salonSeleccionado");
  if (!salon) {
    alert("No hay salón seleccionado.");
    return;
  }

  const tabla = document.getElementById("tablaStockActual");
  tabla.innerHTML = "";

  const ingresos = new Map();
  const pedidos = new Map();

  const ingresoSnap = await getDocs(collection(db, "stock-ingreso"));
  ingresoSnap.forEach((doc) => {
    const data = doc.data();
    if (data.salones === salon) {
      const art = data.articulo;
      const cant = parseInt(data.unidades) || 0;
      ingresos.set(art, (ingresos.get(art) || 0) + cant);
    }
  });

  const pedidosSnap = await getDocs(collection(db, "stock-pedidos"));
  pedidosSnap.forEach((doc) => {
    const data = doc.data();
    if (data.salones === salon) {
      const art = data.articulo;
      const cant = parseInt(data.unidades) || 0;
      pedidos.set(art, (pedidos.get(art) || 0) + cant);
    }
  });

  const articulos = new Set([...ingresos.keys(), ...pedidos.keys()]);
  articulos.forEach((articulo) => {
    const ingreso = ingresos.get(articulo) || 0;
    const pedido = pedidos.get(articulo) || 0;
    const stock = ingreso - pedido;

    const fila = `
      <tr>
        <td>${articulo}</td>
        <td contenteditable="true" oninput="actualizarStock(this)">${ingreso}</td>
        <td contenteditable="true" oninput="actualizarStock(this)">${pedido}</td>
        <td class="stock-actual">${stock}</td>
      </tr>
    `;
    tabla.insertAdjacentHTML("beforeend", fila);
  });
}
