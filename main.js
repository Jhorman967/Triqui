const LINEAS_EN_CUADRICULA = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    
    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6],

]

class Nodo {
    constructor(computadora,posicion) {
        this.computadora = computadora;
        this.posicion = posicion;
        this.evaluacion = this.computadora.evaluarPosicion(this.posicion);
    }

    obtenerHijos(){
        let hijos = [];
        let copiaPosicion = [...this.posicion];
        for (let i = 0; i < this.posicion.length; i++) {
            if(this.posicion[i] === ""){
               copiaPosicion[i] = this.obtenerSimboloSiguiente(this.posicion);
               let nodoHijo = new Nodo(this.computadora, copiaPosicion);  
               hijos.push({nodo:nodoHijo, indice:i});
                copiaPosicion = [...this.posicion];
            }
        }
        return hijos;
    }

    obtenerSimboloSiguiente(posicion){
        let numeroDeX = posicion.filter((cuadro) => cuadro === "X").length;
        let numeroDeO = posicion.filter((cuadro) => cuadro === "O").length;
        if (numeroDeX - numeroDeO === 1) {
          return "O";
        } else {
          return "X";
        }
    }

}

class Computadora {
    constructor(cuadricula, pieza){
        this.cuadricula = cuadricula;
        this.pieza = pieza;
        this.nodo = new Nodo(this, this.cuadricula.posicionActual)
    }

    minimax(nodo, profundidad, jugadorMaximizador, indice = null){
        let valor;
        let exploracion;
        let indiceElegido = null;
        if (
            profundidad === 0 ||
            nodo.obtenerHijos().length == 0 ||
            nodo.evaluacion !== 0
        ){
            return {valor: this.evaluarPosicion(nodo.posicion), indice};
        }
        if (jugadorMaximizador){
            valor = -2;
            for(let hijo of nodo.obtenerHijos()){
                exploracion = this.minimax(
                hijo.nodo,
                profundidad - 1,
                false,
                hijo.indice
                );
                if(exploracion.valor > valor){
                    valor = exploracion.valor;
                    indiceElegido = hijo.indice;
                }
            }
            return {valor, indice: indiceElegido};
        }else {
            valor =  2;
            for(let hijo of nodo.obtenerHijos()){
                exploracion = this.minimax(
                    hijo.nodo,
                    profundidad - 1,
                    true,
                    hijo.indice
                );
                if (exploracion.valor < valor){
                    valor = exploracion.valor;
                    indiceElegido = hijo.indice;
                }
            }
            return {valor, indice: indiceElegido};
        }
    }

    obtenerMejorJugada(){
        this.nodo = new Nodo(this, this.cuadricula.posicionActual);
        if (this.pieza == "O"){
            return this.minimax(this.nodo, 20, false).indice;
        }else{
            return this.minimax(this.nodo, 20, true).indice;
        }
    }


    evaluarPosicion(posicion){
        if(this.cuadricula.obtenerGanador(posicion) === "X"){
            return 1;
        } else if (this.cuadricula.obtenerGanador(posicion) === "O") {
            return -1;
        }else {
            return 0;

        }
    }
} 

class Juego{
    constructor(controlador, turnoDeComputadora){
        this.controlador = controlador;
        this.tablero = new Cuadricula(this);
        this.computadora = new Computadora(this.tablero, turnoDeComputadora);
        this.turnoDeComputadora = turnoDeComputadora;
        this.turnoActual = "X";
        this.ganador = null;
        if (this.turnoActual === this.turnoDeComputadora){
            this.jugarTurno(this.computadora.obtenerMejorJugada(), "computadora");
        }
    }

    cambiarTurnoActual(){
        this.turnoActual = this.turnoActual=== "X" ? "O" : "X";
    }

    jugarTurno(indice,tipoJugador){
        if (this.ganador) return;
        if(
            tipoJugador === "jugador" &&
            this.turnoActual === this.turnoDeComputadora
        )
            return;

        if(indice !== null){
            this.tablero.dibujarJugada(indice);
        }
        this.cambiarTurnoActual();

        if(this.juegoTerminado()){
            this.controlador.finalizarJuego();
            return;
        }

        if (this.turnoActual === this.turnoDeComputadora){
            this.jugarTurno(this.computadora.obtenerMejorJugada(), "computadora");
        }
    }

    juegoTerminado(){
       
        this.ganador = this.tablero.obtenerGanador(this.tablero.posicionActual);
        if(this.ganador){
            return true;
        }
        return false;
    }

}

class ControladorDeJuego {
    constructor(){
        this.juego = new Juego(this, "O");
        this.puntuacionJugador = 0;
        this.puntuacionComputadora = 0;
    };

    actualizarPuntuacion(){
        if (this.juego.ganador !== this.juego.turnoDeComputadora &&
            this.juego.ganador !== "Nadie"){
            this.puntuacionJugador++;
        } else if (
            this.juego.ganador === this.juego.turnoDeComputadora &&
            this.juego.ganador !== "Nadie"){
            this.puntuacionComputadora++;
        }
        document.querySelector("#puntuacion-jugador > p").textContent =
        this.puntuacionJugador;

        document.querySelector("#puntuacion-computadora > p").textContent =
        this.puntuacionComputadora;
    };

    finalizarJuego() {
        this.actualizarPuntuacion();
        this.escribirGanadorEnDom();
    };

    escribirGanadorEnDom(){
        document.querySelector("#ganador").textContent =
        this.juego.ganador + " Gano la ronda";
    }

    reiniciarJuego(turnoDeComputadora = null){
        this.juego = new Juego(this, turnoDeComputadora);
    }
};





class Cuadro {
    constructor(index){
        this.index = index;
    }

    crearCuadro(clase,index){
        let div = document.createElement("div");
        div.classList.add(clase);
        div.classList.add("cuadro");
        div.setAttribute("data-index", index.toString());
        return div;
    }

        construir(){
            switch(this.index){

                case 0:
                    return this.crearCuadro("cuadro-superior-izquierdo", this.index);
                case 1:
                    return this.crearCuadro("cuadro-superior-central", this.index); 
                case 2:
                    return this.crearCuadro("cuadro-superior-derecho", this.index);
                case 3:
                    return this.crearCuadro("cuadro-central-izquierdo", this.index);
                case 4:
                    return this.crearCuadro("cuadro-central", this.index);
                case 5:
                    return this.crearCuadro("cuadro-central-derecho", this.index);
                case 6:
                    return this.crearCuadro("cuadro-inferior-izquierdo",this.index);
                case 7:
                    return this.crearCuadro("cuadro-inferior-central",this.index);
                case 8:
                    return this.crearCuadro("cuadro-inferior-derecho", this.index);   


        }
    }
};




class Cuadricula {
    constructor(juego) {
        this.tag = document.querySelector('#cuadricula');
        this.juego = juego;
        this.posicionActual = ["","","","","","","","",""];
        this.dibujar();
    }

    hayEmpate(posicion){
        for (let cuadro of posicion) {
            if(cuadro === "") {
                return false;
            }
        }
        return "Nadie";
    }

    obtenerGanador(posicion){
        for(let elem of LINEAS_EN_CUADRICULA){
            if(
                posicion[elem[0]] === posicion[elem[1]] &&
                posicion[elem[0]] === posicion[elem[2]] &&
                posicion[elem[0]] !== ""
            ){
                return posicion[elem[0]];

            }
        }

        if (this.hayEmpate(posicion)) return this.hayEmpate(posicion);
        return null;
    };

    obtenerCuadroConIndice(indice){
        return document.querySelector(`[data-index='${indice}']`);

    }

    dibujarJugada(indice){
        this.obtenerCuadroConIndice(indice).textContent = this.juego.turnoActual;
        this.posicionActual[parseInt(indice)] = this.juego.turnoActual;

    }

    agregarEventoDeclickCuadro(cuadro){
        cuadro.addEventListener("click", () =>{
            if(this.posicionActual[parseInt(cuadro.dataset.index)] === ""){
                this.juego.jugarTurno(parseInt(cuadro.dataset.index),"jugador");

            }
        });
    }
    

    construirCuadro(index){
        let cuadro = new Cuadro(index).construir();
        this.agregarEventoDeclickCuadro(cuadro);
        return cuadro;
    }

    dibujar() {
        this.tag.innerHTML="";
        for (let i =0; i <9; i++){
            const cuadro = this.construirCuadro(i);
            this.tag.appendChild(cuadro);
        }
    }

};

function jugarTicTacToe(){
    const juego = new ControladorDeJuego(); 
    document.querySelector("#reiniciar").addEventListener("click",()=>{
        let turnoDeComputadora = document.querySelector("#primer-jugador").value; 
        juego.reiniciarJuego(turnoDeComputadora);
    })
}


jugarTicTacToe();