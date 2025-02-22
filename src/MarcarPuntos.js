import { useState } from "react"

export const MarcarPuntos = () => {
    const [coleccionPuntos , setColeccionInputs] = useState();

    const extraerIpunt = (e) => {
        setColeccionInputs((prev) => [...prev , e.target.value ]);
    }

    const devolverInputLugar = () => {
        <div className="container-opciones">
            <input type="text" onChange={extraerIpunt}/>
        </div>
    }

    return (
        devolverInputLugar
    )
}