import React, { useState} from 'react';
// import 'mdb-react-ui-kit/dist/css/mdb.min.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './estilo/disciplinas.css'
import nextSVG from '../files/svg/next.svg';
import { Modal, Button } from "react-bootstrap";
import closeSVG from '../files/svg/close.svg'

import loadSVG from '../files/svg/loading.svg'

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";


export function ListaDisciplinas(){

      const breakpoint = 1024;
      const [width, setWidth] = useState(window.innerWidth);
      const [data, setData] = useState([]);
      const [disciplinas, setDisciplinas] = useState([]);
      const [periodo, setPeriodo] = useState('Indiferente');
      const [campus, setCampus] = useState('Indiferente');
      const [nome, setNome] = useState('');
      const [checkedState, setCheckedState] = useState([]);
      const [quantidadeSelecionados, setQuantidadeSelecionados] = useState([]);
      const [email, setEmail] = useState('');
      const [showModal, setShow] = useState(false);
      const [emailValid, setEmailValid] = useState(false);
      const [baseurl,setBaseurl] = useState('');
      const [resultadoChamada, setResultadoChamada] = useState('');

      var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


      function handleClose(){ 
        setShow(false)
      };

        function handleShow() {
          if(emailValid){
            setShow(true)
          }
        
      }

      function isEmailValid(str){
       return new RegExp("([A-Za-z0-9][._]?)+[A-Za-z0-9]@[A-Za-z0-9]+(\.?[A-Za-z0-9]){2}\.(com?|net|org)+(\.[A-Za-z0-9]{2,4})?").test(str) 
      }

      function handleEmail(e) {
        setEmailValid(isEmailValid(e.target.value))
        setEmail(e.target.value);
      }

      function handleChange(e) {
        setNome(e.target.value);
      }

      function handleCampus(e) {
        setCampus(e.target.value);
      }

      function handlePeriodo(e) {
        setPeriodo(e.target.value);
      }

      function campusResumido (str) {
        switch(str){
              case 'Campus São Bernardo do Campo':
                    return <div className="badge rounded-pill bg-warning text-dark">SB</div>
              
              case 'Campus Santo André':
                    return <div className="badge rounded-pill bg-success">SA</div>
              
              default:
                    return ''   
        } 
      }

      function handleCheck(id){
        checkedState.set(id,[!checkedState.get(id)[0],checkedState.get(id)[1]])
        var teste = new Map([...checkedState].filter(([k, v])=>v[0]==true))
        setQuantidadeSelecionados(teste)
        if(teste.size <= 0){
          handleClose()
        }
      }

      React.useEffect(async () => {
        if(resultadoChamada != ''){
          let loading = document.getElementById("loading-icon")
          loading.className  = "d-none"          
        }

      }
      ,[resultadoChamada])

      

      //Faz get Disciplinas
      React.useEffect(async () => {
        window.onbeforeunload = function() { 'some function that does not reload the page' }

                  if (data.length == 0){
                    const controller = new AbortController()

                    // 5 second timeout:
                    const timeoutId = setTimeout(() => controller.abort(), 5000)


                    const response = await fetch('http://localhost:8071/api/disciplina',
                    {
                      signal: controller.signal,
                      method : 'GET',
                      headers : {"Content-Type": "application/json",
                      "Access-Control-Allow-Origin": "*",
                      "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
                      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
                    },
                      
                    }).catch("Erro")
                    .then((response) => response.json())
                    .then(response => {
                      setData(response)
                      setResultadoChamada('OK')
                    })
                    .catch(()=> setResultadoChamada('OFF'));
                    return () => {};
                  }

          },[]);


      function postAlerta(){

        let buttonId = document.getElementById("botaoAlerta")
        buttonId.disabled=true
        document.body.style.cursor = 'wait'
        let houveErro = false

        quantidadeSelecionados.forEach((k,v) =>{
        var base = document.getElementById("materia_" + v).innerText
        
        let str = `{"idDisciplina": "${v}", "email": "${email}"}`
        console.log("str: ",str)

        let myElement = document.getElementById("materia_" + v);
        myElement.innerHTML = base +  '   <br/><span class="badge bg-warning text-dark">ENVIANDO</span>'
        // console.log(myElement.innerHTML)

        fetch('http://localhost:8071/api/alerta', {
          method : 'POST',
          headers : {"Content-Type": "application/json"},
          body: str
        }).then((p)=> {
            if(p.status==200){
              let myElement = document.getElementById("materia_" + v);
              myElement.innerHTML = base + '    <br/><span class="badge bg-success">OK</span>'
            }
            if(p.status==500){
              let myElement = document.getElementById("materia_" + v);
              myElement.innerHTML = base + '    <br/><span class="badge bg-danger">Erro</span>'
              houveErro = true
            }
        })
        .then(()=>{
          if(!houveErro){
            setTimeout(function(){
              document.body.style.cursor = 'default'
              handleClose()
              buttonId.disabled=false
          }, 3000);
          }
        })
      })

      }    

      //Cria Map com checkbox e id das disciplinas
      React.useEffect( async () =>{
        var map = new Map();
        data.forEach(d => {
           map.set(d.identificadorUFABC,[false,d.nomeDisciplina,0])
        });
        console.log(map)
         setCheckedState(map)
      },[data])

      //Atualiza tamanho da tela
      React.useEffect(() => {
            window.addEventListener("resize", () => setWidth(window.innerWidth)
            );
          }, [window.innerWidth]);

      function simplifyText(str){
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLocaleUpperCase();
      }
        
      //Atualiza filtro disciplinas
      React.useEffect(async () => {
            let disciplinasFiltradas = data

            if (periodo != 'Indiferente'){
            disciplinasFiltradas = disciplinasFiltradas.filter(d => {return d.periodo == periodo.toLocaleUpperCase()})
            }
            if(campus != 'Indiferente'){
            disciplinasFiltradas = disciplinasFiltradas.filter(d => {return d.campus.includes(campus)})
            }
            if(nome != ''){
              disciplinasFiltradas = disciplinasFiltradas.filter(d => {return simplifyText(d.nomeDisciplina).includes(simplifyText(nome))})
              }

            setDisciplinas(disciplinasFiltradas)
             
          },[data,periodo,campus,nome]);


          function generateBigTable(){
           
              
            return (
              <>
                        { disciplinas.map(item => 
                          (<tr key={item.identificadorUFABC}>
                                <td><input type="checkbox" checked={checkedState.get(item.identificadorUFABC)[0]} id={"checkbox_"+item.identificadorUFABC} className="plus-minus" value={item.identificadorUFABC} onChange={() => handleCheck(item.identificadorUFABC)}/></td>
                                <td className="text-start text-wrap">{item.nomeDisciplina.substring(0, item.nomeDisciplina.indexOf('-'))}</td>
                                <td className='text-center'>{item.periodo}</td>
                                {width >= breakpoint ? <td className='text-center'>{item.vagasDisponibilizadas}</td> : <></>}
                                <td className='text-center'>{item.vagasIngressantes}</td>
                                <td className='text-center'>{item.vagasDisponiveis}</td>
                                {width >= breakpoint ? <td className='text-center'>{item.creditos}</td> : <></>}
                                {width >= breakpoint ? <td className='text-center'>{item.codigo}</td>   : <></>} 
                                <td className='text-center'>{campusResumido(item.campus)}</td> 
                          </tr>)
                          )}
                  </>
            )

          }

    function generateSmallTable(){


        return (
            <>
                { disciplinas.map(item =>
                    (<tr key={item.identificadorUFABC} className="d-flex">
                        <td className="">
                            <div className="d-flex align-items-center w-100 h-100">
                                <input type="checkbox" checked={checkedState.get(item.identificadorUFABC)[0]} id={"checkbox_"+item.identificadorUFABC} className="buttonSmallTable" value={item.identificadorUFABC} onChange={() => handleCheck(item.identificadorUFABC)}/>
                            </div>
                              </td>
                        <td className="text-start text-wrap smallTableParent w-100 ">
                            <div className="smallTableContent smallTableTitle smallTableHeader">
                                {item.nomeDisciplina.substring(0, item.nomeDisciplina.indexOf('-'))}
                            </div>
                            <div className="smallTableContent smallTableQuantity">
                                Vagas disponíveis <br/>
                                {item.vagasDisponiveis}/{item.vagasDisponibilizadas}
                            </div>
                            <div className="smallTableContent smallTableFlexContainer">
                                <div>
                                    {item.periodo}
                                </div>
                                <div>
                                    {campusResumido(item.campus)}
                                </div>
                                <div>
                                    {item.creditos} Créditos
                                </div>
                            </div>
                        </td>
                    </tr>)
                )}
            </>
        )

    }

    function showBigTable() {
        return (<>

            <table className="table table-striped shadow-sm p-3 mb-5 w-75 rounded-bottom " data-toggle="table" data-pagination="true" data-mobile-responsive="true" id="myTable">
                <thead className="sticky-top bg-white border-black">
                <tr>
                    <th className="p-3 cursor-pointer"></th>
                    <th className='disciplina'>Disciplina</th>
                    <th className='position-sticky'>Período</th>
                    <th>Vagas Liberadas</th>
                    {width >= breakpoint ? <th>Vagas Ingressantes</th> : <></>}
                    <th>Vagas Disponiveis</th>
                    {width >= breakpoint ? <th>Créditos</th> : <></>}
                    {width >= breakpoint ? <th>Códigos</th> : <></>}
                    <th>Campus</th>
                </tr>
                </thead>
                <tbody>
                {resultadoChamada != 'OFF' ? generateBigTable() : ''}
                {generateBigTable()}
                </tbody>
            </table>



        </>)



    }

    function showSmallTable() {
        return (

            <>
                <table className="table table-striped shadow-sm p-3 mb-5 w-75 rounded-bottom d-flex" data-toggle="table" data-pagination="true" data-mobile-responsive="true" id="myTable">
                    <tbody>
                    {resultadoChamada != 'OFF' ? generateSmallTable() : ''}
                    {generateSmallTable()}
                    </tbody>
                </table></>

        )
    }

    return (
              <>
        
        <div className='font-size j'>

              
        <div className="container_2 d-flex w-75 justify-content-center p-3 mt-5">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row">
            <label className='text-center'>Nome Disciplina</label>
              <input type="text" className="form-control"  value={nome}  onChange={(e) => handleChange(e)} />  
            </div>
              
            <div className="row">
            
              <div className="col text-center">
              <label className='text-center'>Periodo</label>
                <select className="form-control text-center" id="periodo" onChange={(e) => handlePeriodo(e)} defaultValue="Indiferente" >
                  <option>Matutino</option>
                  {/* <option>Vespertino</option> */}
                  <option>Noturno</option>
                  <option selected>Indiferente</option>
                </select>
          
              </div> 
            
              <div className="col text-center">
              <label className=''>Campus</label>
              <div className="form-group ">
                <select className="form-control text-center" id="campus" onChange={(e) => handleCampus(e)} defaultValue="Indiferente">
                  <option>São Bernardo do Campo</option>
                  <option>Santo André</option>
                  <option>Indiferente</option>
                </select>
              </div> 
              </div> 
        
        </div>
          </form>

      </div>
              
              <div className="d-flex justify-content-center">

                  {width >= breakpoint ? showBigTable() : showSmallTable()}


              
              </div>
              <div className='d-flex justify-content-center '>
              {resultadoChamada == '' ? <img src={loadSVG} id='loading-icon'/> : ''}
              {resultadoChamada == 'OFF' ? <h1 className='text-center w-100'>Fora do periodo de matrícula</h1> : ''}
              </div>
              
              <div className={quantidadeSelecionados.size > 0 ? "container-bottom-email row" : "container-bottom-email row d-none"}>
                    <div className="col d-flex flex-row justify-content-center mt-2">
                            <form onSubmit={e => e.preventDefault()}>
                            <input type="email" placeholder='E-mail' className='form-control text-center'  value={email} onChange={(e) => {handleEmail(e)}}></input>
                            </form> 

                            <div className={emailValid ? "email-valid" : "email-not-valid"}>
                            <img src={nextSVG}  className="next-button ms-3" onClick={() => handleShow()}/>
                            </div>                        
                      </div>       
              </div>

              
                
              </div>


              
                  <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Confirme as disciplinas</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            
              Desejo receber notificações para as disciplinas: 
              <ul> 
            {Array.from(quantidadeSelecionados).map(item => 
                          (<li className='m-3' id={"materia_"+item[0]} key={item[0]}>{item[1]} <img src={closeSVG} onClick={()=> {quantidadeSelecionados.delete(item[0]); handleCheck(item[0])}} className="closeButton"/> </li>) 
                          )}
              </ul> 

            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" disabled={ quantidadeSelecionados.size<=0 } id="botaoAlerta" onClick={postAlerta}>
                Confirmar
              </Button>
            </Modal.Footer>
          </Modal>




              </>
              
              );
    }












    
