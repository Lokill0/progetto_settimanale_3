// arrey libri - base dati

let libri = [
   {
      id: 1,
      titolo: "Delitto e castigo",
      autore: "Fëdor Dostoevskij",
      anno: 1866,
      stato: "letto"
   },
   {
      id: 2,
      titolo: "La metamorfosi",
      autore: "Franz Kafka",
      anno: 1915,
      stato: "da-leggere"
   }
];

// Caricamento dei libri salvati

const libriSalvati = localStorage.getItem("libri");

if (libriSalvati !== null) {
   try {
      libri = JSON.parse(libriSalvati);
   } catch (errore) {
      console.log("Errore nel caricamento dei libri salvati.");
   }
}

// variabili scelta utente

let ricerca = "";
let filtro = "tutti";
let ordinamento = "anno-crescente";
let libroInModifica = null;
let timerNotifica;

// Selezione degli elementi HTML

const lista = document.querySelector(".lista");
const formLibro = document.querySelector("#formLibro");

const inputTitolo = document.querySelector("#titolo");
const inputAutore = document.querySelector("#autore");
const inputAnno = document.querySelector("#anno");
const selectStato = document.querySelector("#stato");

const inputRicerca = document.querySelector("#Ricerca");
const selectFiltro = document.querySelector("#filtro1");
const selectOrdinamento = document.querySelector("#filtro2");

const totale = document.querySelector("#totale");
const letti = document.querySelector("#letti");
const daLeggere = document.querySelector("#daLeggere");
const barraRiempimento = document.querySelector("#barraRiempimento");

const notifica = document.querySelector("#notifica");
const btnTema = document.querySelector("#btnTema");

// Salvataggio dei libri

function salvaLibri() {
   try {
      localStorage.setItem("libri", JSON.stringify(libri));
   } catch (errore) {
      mostraNotifica("Impossibile salvare i libri nel browser.");
   }
}

// Notifiche temporanee

function mostraNotifica(messaggio) {
   clearTimeout(timerNotifica);

   notifica.textContent = messaggio;
   notifica.style.display = "block";

   console.log("Notifica mostrata:", messaggio);

   timerNotifica = setTimeout(() => {
      notifica.style.display = "none";
   }, 3000);
}


// Funzione per visualizzare i libri

function render() {
   lista.innerHTML = "";                                                       //svuotiamo la lista

   let libriFiltrati = libri.filter((libro) => {
      return libro.titolo.toLowerCase().includes(ricerca.toLowerCase()) ||
         libro.autore.toLowerCase().includes(ricerca.toLowerCase());
   });

   if (filtro !== "tutti") {
      libriFiltrati = libriFiltrati.filter((libro) => libro.stato === filtro);
   }

   libriFiltrati.sort((a, b) => {
      if (ordinamento === "anno-crescente") {
         return a.anno - b.anno;
      } else if (ordinamento === "anno-decrescente") {
         return b.anno - a.anno;
      } else if (ordinamento === "titolo-az") {
         return a.titolo.localeCompare(b.titolo);
      } else if (ordinamento === "titolo-za") {
         return b.titolo.localeCompare(a.titolo);
      }
   });

   libriFiltrati.forEach((libro) => {                                          //cicliamo e visualizziamo i libri
      const card = document.createElement("div");                              // creo la card
      card.classList.add("libro");                                             // assegno il css
      const titolo = document.createElement("h3");                             // estraggo gli elementi
      titolo.textContent = libro.titolo;                                       // correnti

      const autoreAnno = document.createElement("p");                          // e li assegno
      autoreAnno.textContent = libro.autore + " - " + libro.anno;              // ad una variabile
      const stato = document.createElement("span");                            // Creiamo lo stato del libro
      stato.textContent = libro.stato === "letto" ? "Letto" : "Da leggere";
      stato.classList.add("stato-" + libro.stato);
      const azioni = document.createElement("div");
      azioni.classList.add("azioni");                                          // contenitore pulsanti

      const btnStato = document.createElement("button");                       // bottoni

      if (libro.stato === "letto") {
         btnStato.textContent = "Segna da leggere";
      } else {
         btnStato.textContent = "Segna letto";
      }

      btnStato.addEventListener("click", () => {
         if (libro.stato === "letto") {
            libro.stato = "da-leggere";
         } else {
            libro.stato = "letto";
         }

         salvaLibri();
         render();
         mostraNotifica("Stato del libro aggiornato.");
      });

      const btnModifica = document.createElement("button");
      btnModifica.textContent = "Modifica";

      btnModifica.addEventListener("click", () => {
         libroInModifica = libro.id;

         inputTitolo.value = libro.titolo;
         inputAutore.value = libro.autore;
         inputAnno.value = libro.anno;
         selectStato.value = libro.stato;

         formLibro.querySelector("button[type='submit']").textContent = "Salva modifiche";

         formLibro.scrollIntoView({ behavior: "smooth" });
      });

      const btnElimina = document.createElement("button");
      btnElimina.textContent = "Elimina";

      btnElimina.addEventListener("click", () => {
         libri = libri.filter((elemento) => elemento.id !== libro.id);

         if (libroInModifica === libro.id) {
            libroInModifica = null;
            formLibro.reset();
            formLibro.querySelector("button[type='submit']").textContent = "Aggiungi";
         }

         salvaLibri();
         render();
         mostraNotifica("Libro eliminato correttamente.");
      });


      card.appendChild(titolo);
      card.appendChild(autoreAnno);                                            // titolo e paragrafo    
      card.appendChild(stato);
      azioni.appendChild(btnStato);
      azioni.appendChild(btnModifica);
      azioni.appendChild(btnElimina);

      card.appendChild(azioni);
      lista.appendChild(card);                                                 // aggiungo card alla lista                                  

   });

   aggiornaStatistiche();

}

function aggiornaStatistiche() {
   const numeroTotale = libri.length;
   const numeroLetti = libri.filter((libro) => libro.stato === "letto").length;
   const numeroDaLeggere = libri.filter((libro) => libro.stato === "da-leggere").length;

   totale.textContent = numeroTotale;
   letti.textContent = numeroLetti;
   daLeggere.textContent = numeroDaLeggere;

   const percentuale = numeroTotale === 0 ? 0 : (numeroLetti / numeroTotale) * 100;
   barraRiempimento.style.width = percentuale + "%";
}

render();

// Aggiungere un libro dal form
formLibro.addEventListener("submit", (event) => {
   event.preventDefault();

   const stavaModificando = libroInModifica !== null;

   if (stavaModificando) {
      const libro = libri.find((elemento) => elemento.id === libroInModifica);

      if (libro) {
         libro.titolo = inputTitolo.value.trim();
         libro.autore = inputAutore.value.trim();
         libro.anno = Number(inputAnno.value);
         libro.stato = selectStato.value;
      }

      libroInModifica = null;
      formLibro.querySelector("button[type='submit']").textContent = "Aggiungi";
   } else {
      const nuovoLibro = {
         id: Date.now(),
         titolo: inputTitolo.value.trim(),
         autore: inputAutore.value.trim(),
         anno: Number(inputAnno.value),
         stato: selectStato.value
      };

      libri.push(nuovoLibro);
   }

   salvaLibri();
   formLibro.reset();
   render();

   if (stavaModificando) {
      mostraNotifica("Libro modificato correttamente.");
   } else {
      mostraNotifica("Libro aggiunto correttamente.");
   }
});

// Ricerca per titolo e autore

inputRicerca.addEventListener("input", () => {
   ricerca = inputRicerca.value;
   render();
});

// Filtro per stato

selectFiltro.addEventListener("change", () => {
   filtro = selectFiltro.value;
   render();
});

// Ordinamento dei libri

selectOrdinamento.addEventListener("change", () => {
   ordinamento = selectOrdinamento.value;
   render();
});

// Tema scuro

btnTema.addEventListener("click", () => {
   document.body.classList.toggle("dark-mode");
});