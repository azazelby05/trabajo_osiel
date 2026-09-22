function Student({estudiante}) {
    return(
        <div className="estudiante">
            <h3>{estudiante?.nombre}</h3>
            <p>{estudiante?.matricula}</p>
        </div>
    );
}

export default Student;