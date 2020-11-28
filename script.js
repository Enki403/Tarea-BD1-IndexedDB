/**
 * @author Hector Jose Vasquez Lopez <hjvasquez@unah.hn>
 * @date 28/11/2020
 * @version 0.3
 */

/**
 * * Nombre de la base de datos 
 *  @const {string} 
 */
const DB_NOMBRE = 'DBTarea';

/**
 * * Version de la base de datos 
 *  @const {Number} 
 */
const DB_VERSION = 1;

/**
 * * Nombre de la tabla(id, texto) 
 *  @const {string} 
 */
const DB_STORE_NOMBRE = 'tabla';

//* Conexion a la base de datos a la que se asocia la transaccion 
var db;

//* Almacena el valor de la llave actual
var current_key;

/** 
 * * Obtener el ObjectStore 
 * @param   {string} store_name - El nombre de la tabla
 * @param   {string} mode - El nombre del modo e.g. readonly o readwrite
 * @return  {objectStore} - El objectStore de la transaccion de db
 */
const getObjectStore = (store_name, mode) => {

    //* Se crea una transaccion
    let aux = db.transaction(store_name, mode);

    //* Retorna el objectStore de la transacción
    return aux.objectStore(store_name);
};

/** 
 * * Imprime en el campo del control 2
 * @param   {string} value - El valor que se escribira en el campo del control 2
 * @param   {Number} key - El numero del id que corresponde al texto de 'value' en la base de datos
 */
const print = (value, key) => {

    //* Imprimer el texto en el campo 2
    document.querySelector("#texto").value = value;

    //* Se le asigna el valor de 'key' a 'current_key' 
    current_key = key;
};

/** 
 * * Limpia el contenido del campo 2 en el control 2 
 */
const limpiar = () => {
    document.querySelector("#texto").value = "";
    //? console.log("Limpiado");
};

/**
 * * Inicializa IndexedDB y crea una conexion asociada a la variable db
 */
const init = () => {

    //* Se abre una conexion
    let peticion = indexedDB.open(DB_NOMBRE, DB_VERSION);

    //* Si la peticion se resuelve sin errores
    peticion.onsuccess = (evento) => {

        //* Se asocia a la variable db la conexion
        db = peticion.result;

        //* Se llama a la funcion 'count' de objectStore
        getObjectStore(DB_STORE_NOMBRE, 'readwrite').count().onsuccess = (evento) => {

            //* Si IndexedDB no esta vacia
            if (evento.target.result > 0) {

                //* Llama a la funcion 'primero'
                primero();
            }
        };
    };

    //* Si la peticion no se resuelve debido a errores
    peticion.onerror = (evento) => {

        //* se alerta el codigo de error
        console.warn(evento.target.errorCode);
    };

    //* Handler del evento 'upgradeneeded'
    peticion.onupgradeneeded = (evento) => {
        let store = evento.currentTarget.result.createObjectStore(DB_STORE_NOMBRE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('texto', 'texto', { unique: true });
    };
};

/**
 * * Agrega, a la base de datos, la cadena que se encuentra en el control 2
 */
const agregar = () => {

    //* Se guarda en un json el valor del contenedor 2
    let datos = { 'texto': document.querySelector("#texto").value };

    //* Se agrega a la base de datos el objeto que se almacena en datos
    let peticion = getObjectStore(DB_STORE_NOMBRE, 'readwrite').add(datos);

    //* Si la peticion se resuelve sin errores
    peticion.onsuccess = (evento) => {

        //* Se menciona a traves de la cosnola que el elemento se a agregado con exito
        console.log("Elemento agregado exitosamente!");
    };

    //* Si la peticion no se resuelve debido a errores
    peticion.onerror = (evento) => {

        //* Se alerta que el elemento ya estaba agregado y que existe un texto igual en la base de datos
        console.warn("Ya se ha agregado este texto.");
    };
};

/**
 * * Elimina, de la base de datos, la cadena que se encuentra en el control 2 y limpia dicho control.
 */
const eliminar = () => {

    //* Se apertura un cursor
    let current = getObjectStore(DB_STORE_NOMBRE, 'readwrite').openCursor();

    //* Si la peticion se resuelve sin errores
    current.onsuccess = (evento) => {

        //* Se asigna el resultado a la variable cursor
        let cursor = evento.target.result;

        //* Mientras el cursor sea distinto de null
        if (cursor) {

            //* Si la llave a la que apunta el cursor es igual a la llave actual
            if (cursor.key == current_key) {

                //* Si la eliminacion del elemento del cursor actual es satisfactorio 
                getObjectStore(DB_STORE_NOMBRE, 'readwrite').delete(cursor.key).onsuccess = (evt) => {

                    //* Se limpia el campo 2
                    limpiar();
                };

                //* Se aborta la transaccion
                current.transaction.abort();
            } else {

                //* De otro modo el cursor sigue avanzando
                cursor.continue();
            }
        }
    };

    //* Si la peticion no se resuelve debido a errores
    current.onerror = (evento) => {

        //* se alerta el codigo de error
        console.warn(evento.target.errorCode);
    };

    //* Se Ejecuta al abortar la transaccion
    current.transaction.onabort = (evento) => {};
};

/**
 * * Modifica el elemento en la base de datos con la cadena que se encuentra en el control 2
 */
const modificar = () => {

    //* Se apertura un cursor
    let current = getObjectStore(DB_STORE_NOMBRE, 'readwrite').openCursor();

    //* Si la peticion se resuelve sin errores
    current.onsuccess = (evento) => {

        //* Se asigna el resultado a la variable cursor
        let cursor = evento.target.result;

        //* Mientras el cursor sea distinto de null
        if (cursor) {

            //* Si la llave a la que apunta el cursor es igual a la llave actual 
            if (cursor.key == current_key) {

                //* Se modifica el elemento al que el cursor apunta actualmente
                getObjectStore(DB_STORE_NOMBRE, 'readwrite').put({ texto: document.querySelector("#texto").value, id: cursor.key }).onsuccess = (evt) => {};

                //* Se aborta la transaccion
                current.transaction.abort();
            } else {

                //* De otro modo el cursor sigue avanzando
                cursor.continue();
            }
        }
    };

    //* Si la peticion no se resuelve debido a errores
    current.onerror = (evento) => {

        //* se alerta el codigo de error
        console.warn(evento.target.errorCode);
    };

    //* Se Ejecuta al completar la transaccion
    current.transaction.oncomplete = (evento) => {};
};

/**
 * * El apuntador al elemento a la tabla en la base de datos se desplaza en uno hacia el primer elemento.
 */
const anterior = () => {

    //* Se apertura un cursor de atras hacia adelante y un upperBound de modo que el primer elemento del cursor sea el previo al actual
    let current = getObjectStore(DB_STORE_NOMBRE, 'readwrite').openCursor(IDBKeyRange.upperBound(current_key - 1), 'prev');

    //* Si la peticion se resuelve sin errores
    current.onsuccess = (evento) => {

        //* Se asigna el resultado a la variable cursor
        let cursor = evento.target.result;

        //* Mientras el cursor sea distinto de null
        if (cursor) {

            //* Se imprime el siguiente elemento
            print(cursor.value.texto, cursor.key);
        }
    };

    //* Si la peticion no se resuelve debido a errores
    current.onerror = (evento) => {

        //* se alerta el codigo de error
        console.warn(evento.target.errorCode);
    };

    //* Se Ejecuta al abortar la transaccion
    current.transaction.onabort = (evento) => {};
};

/**
 * * El apuntador al elemento a la tabla en la base de datos se desplaza en uno hacia el ultimo elemento.
 */
const siguiente = () => {

    //* Se apertura un cursor con lowerBound de modo que el primer elemento del cursor sea el siguiente al actual
    let current = getObjectStore(DB_STORE_NOMBRE, 'readwrite').openCursor(IDBKeyRange.lowerBound(current_key + 1));

    //* Si la peticion se resuelve sin errores
    current.onsuccess = (evento) => {

        //* Se asigna el resultado a la variable cursor
        let cursor = evento.target.result;

        //* Mientras el cursor sea distinto de null
        if (cursor) {

            //* Se imprime el siguiente elemento
            print(cursor.value.texto, cursor.key);
        }
    };

    //* Si la peticion no se resuelve debido a errores
    current.onerror = (evento) => {

        //* se alerta el codigo de error
        console.warn(evento.target.errorCode);
    };

    //* Se Ejecuta al abortar la transaccion
    current.transaction.onabort = (evento) => {};
};

/**
 * * El apuntador al elemento a la tabla en la base de datos se mueve al primer elemento.
 */
const primero = () => {

    //* Se apertura un cursor
    let current = getObjectStore(DB_STORE_NOMBRE, 'readwrite').openCursor();

    //* Si la peticion se resuelve sin errores
    current.onsuccess = (evento) => {

        //* Se asigna el resultado a la variable cursor
        let cursor = evento.target.result;

        //* Mientras el cursor sea distinto de null
        if (cursor) {

            //* Se imprime el texto del elemento al que apunta el cursor
            print(cursor.value.texto, cursor.key);
        }
    };

    //* Si la peticion no se resuelve debido a errores
    current.onerror = (evento) => {

        //* se alerta el codigo de error
        console.warn(evento.target.errorCode);
    };
};

/**
 * * El apuntador al elemento a la tabla en la base de datos se mueve al ultimo elemento.
 */
const ultimo = () => {

    //* Se apertura un cursor de atras hacia adelante
    let current = getObjectStore(DB_STORE_NOMBRE, 'readonly').openCursor(null, 'prev');

    //* Si la peticion se resuelve sin errores
    current.onsuccess = (evento) => {

        //* Se asigna el resultado a la variable cursor
        let cursor = evento.target.result;

        //* Mientras el cursor sea distinto de null
        if (cursor) {

            //* Se imprime el texto del elemento al que apunta el cursor
            print(cursor.value.texto, cursor.key);
        }
    };

    //* Si la peticion no se resuelve debido a errores
    current.onerror = (evento) => {

        //* se alerta el codigo de error
        console.warn(evento.target.errorCode);
    };
};

/**
 * *Se asigna un evento de click que ejecuta una funcion dependiendo del radio button seleccionado
 */
document.querySelector("#aceptar").addEventListener("click", () => {

    //* se le asigna a aceptar el objeto del DOM cuyo 'name' es 'accion' y esta seleccionado
    let aceptar = document.querySelector("[name = accion]:checked");

    //* Si aceptar es distinto de null
    if (aceptar != null) {

        //* Se realiza una una decision dependiendo del id de aceptar.
        switch (aceptar.id) {
            case "agregar":

                //* En caso de que el radio button seleccionado sea 'agregar' se le llama a la funcion 'agregar()'
                agregar();
                break;
            case "eliminar":

                //* En caso de que el radio button seleccionado sea 'eliminar' se le llama a la funcion 'eliminar()'
                eliminar();
                break;
            case "modificar":

                //* En caso de que el radio button seleccionado sea 'modificar' se le llama a la funcion 'modificar()'
                modificar();
                break;
            case "anterior":

                //* En caso de que el radio button seleccionado sea 'anterior' se le llama a la funcion 'anterior()'
                anterior();
                break;
            case "siguiente":

                //* En caso de que el radio button seleccionado sea 'siguiente' se le llama a la funcion 'siguiente()'
                siguiente();
                break;
            case "primero":

                //* En caso de que el radio button seleccionado sea 'primero' se le llama a la funcion 'primero()'
                primero();
                break;
            case "ultimo":

                //* En caso de que el radio button seleccionado sea 'ultimo' se le llama a la funcion 'ultimo()'
                ultimo();
                break;
            default:
                console.error("Error: ¡Opcion no valida!");
                break;
        }
    } else {

        //* De otro modo se alerta que ninguna opcionfue seleccionada
        console.warn("Ninguna opcion fue seleccionada.");
    }
});

/**
 * * Se asigna un evento de click que ejecuta la funcion limpiar
 */
document.querySelector("#limpiar").addEventListener("click", limpiar);


//* Se llama a la funcion que inicializa las conexiones a la base de datos
init();