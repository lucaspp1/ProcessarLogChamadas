let contWarningNotFoundToMap = 0;

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const processButton = document.getElementById('processButton');
    const messageDisplay = document.getElementById('message');

    let fileName = ''; // Para armazenar o nome original do arquivo

    // Habilita o botão quando um arquivo é selecionado
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            processButton.disabled = false;
            fileName = fileInput.files[0].name; // Salva o nome do arquivo
            messageDisplay.textContent = `Arquivo "${fileName}" selecionado. Pronto para processar!`;
        } else {
            processButton.disabled = true;
            messageDisplay.textContent = 'Nenhum arquivo selecionado.';
        }
    });

    // Lógica para processar e baixar o arquivo
    processButton.addEventListener('click', () => {
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;
                const lines = content.split('\n');
                const modifiedLines = lines.filter( x => x.trim() && x.trim() != "\r" ).map(processarLinhas);
                const modifiedContent = modifiedLines.join('\n');

                // Cria um Blob com o conteúdo modificado
                const blob = new Blob([modifiedContent], { type: 'text/plain' });

                // Cria um link para download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `modificado_${fileName}`.replace(".txt", ".csv"); // Prefixo para o nome do arquivo
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Libera a URL do objeto

                messageDisplay.textContent = `Arquivo "${fileName}" processado e baixado como "modificado_${fileName.replace(".txt", ".csv")}" com sucesso!`;
                // document.getElementById("joinha").style.display = "block";
            };

            reader.onerror = () => {
                messageDisplay.textContent = 'Erro ao ler o arquivo.';
            };

            reader.readAsText(file); // Lê o arquivo como texto
        } else {
            messageDisplay.textContent = 'Por favor meu chefe, seleciona arquivo primeiro.';
        }
    });
});

function processarLinhas(line){
    
    const parts = line.split(';').filter(part => part !== null && part.trim() !== '');
    clearExportFormat()

    for (let idx = 0; idx < parts.length; idx++) {

        const element = parts[idx].trim();
        if (validField(element)) {
            formatProcessContent(element, line);
        }
    }
    return ExportDataRow();
}

function reogarnizeData(fullData){
    // inicio: '',
    // fim: '',
    for (let idx = 0; idx < fullData.length; idx++) {
        console.log({
            teste: undStr,
            teste2: fullData[idx]
        })
        if( fullData[idx].fim == undStr && fullData[idx].inicio != undStr){
            console.log({teste: fullData[idx]})
            fullData[idx].fim =  Object.assign(fullData[idx].inicio);
            fullData[idx].inicio = "00:00:00";
        }
    }
    return fullData;
}

// Funcoes Auxiliares

function getInfoByRamal(ramal){
    
    for (const i in dePara) {
        if(ramal == dePara[i].ramal) return dePara[i]
    }
    return null

}

function validField(element) {
    let isValidField = false;
    for (const key in regexFilters) {
        if (regexFilters[key].test(element))
            isValidField = true
    }
    return isValidField
}

function ExportDataRow() {
    const result = [
        exportFormat.data,
        exportFormat.time,
        exportFormat.tipo,
        exportFormat.ramal,
        exportFormat.fim == undStr ? "00:00:00" : exportFormat.inicio,
        exportFormat.fim == undStr ? exportFormat.inicio : exportFormat.fim,
        exportFormat.telefone,
        exportFormat.user,
        exportFormat.status,
        exportFormat.setor,
        exportFormat.pbax2
    ].join(';');

    return result
}

function clearExportFormat() {
    exportFormat.data = undStr
    exportFormat.time = undStr
    exportFormat.tipo = undStr
    exportFormat.ramal = undStr
    exportFormat.inicio = undStr
    exportFormat.fim = undStr
    exportFormat.telefone = undStr
    exportFormat.user = undStr
    exportFormat.status = undStr
    exportFormat.setor = undStr
    exportFormat.pbax2 = undStr
}

function formatProcessContent(content, fullLine) {

    if (regexFilters.data.test(content))
        exportFormat.data = content;

    if (regexFilters.status.test(content))
        exportFormat.status = content;

    if (regexFilters.ramal.test(content)) {
        
        const extraElements = getInfoByRamal(content)
        if(extraElements){
            exportFormat.setor = extraElements.setor
            exportFormat.status = extraElements.status
            exportFormat.user = extraElements.usuario
        }else{
            if(contWarningNotFoundToMap++ <= 15){

                if(contWarningNotFoundToMap == 1){
                    console.log(" === Conteudos não achados no mapeamento === ")    
                }
                console.log({
                    NotFoundRamal: fullLine,
                    ramal: content
                });
            }
        }

        if(exportFormat.ramal != undStr){
            exportFormat.pbax2 = content;
        }else{
            exportFormat.ramal = content;
        }
    }
    
    if (regexFilters.time.test(content) || regexFilters.hours.test(content)) {

        if( /^(0[5-9]|1[0-9]|2[0-4])/.test(content) ){
            exportFormat.time = content
        }else{
            if( exportFormat.inicio == undStr ){
                exportFormat.inicio = content 
            }else { 
                exportFormat.fim = content 
            }
        }

    }

    if (regexFilters.cellNumber.test(content)) {
        if( exportFormat.telefone != undStr ){
            exportFormat.pbax2 = content
        }else exportFormat.telefone = content
    }
    if (regexFilters.tipo.test(content)) {
        exportFormat.tipo = content
    }
}

let i = 1

// CONSTANTS
const undStr = "NAO ATENDIDO"

const exportFormat = {
    data: '',
    time: '',
    tipo: '',
    ramal: '',
    inicio: '',
    fim: '',
    telefone: '',
    user: '',
    status: '',
    setor: '',
    pbax2: ''
}

const regexFilters = {

    // data: "03.01.25"
    data: /^\d{2}\.\d{2}\.\d{2}$/,

    // status = "1,2,35"
    status: /^(1|2|35)$/,

    // ramal: 4 digits
    ramal: /^\d{4}$/,

    // tipo: 2 digits
    tipo: /^\d{1,2}$/,

    // time: "00:01"
    time: /^\d{2}:\d{2}$/,

    // hora: "00:00:01"
    hours: /^\d{2}:\d{2}:\d{2}$/,

    // de 8 até 15 digitos
    cellNumber: /^\d{8,15}$/
};

const dePara = [
{ AUXILIAR:"MARIA LUIZA RAYSSA GUARAPARI",  ramal: "3800",  usuario: "MILENA RAYSSA", status: "ATIVO", setor: "GUARAPARI"},
{ AUXILIAR:"URA PABX",  ramal: "3600",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URA COMERCIAL",  ramal: "3630",  usuario: "URA", status: "ATIVO", setor: "COMERCIAL"},
{ AUXILIAR:"FLAVIA PISICOLOGIA",  ramal: "3561",  usuario: "FLAVIA", status: "ATIVO", setor: "PISICOLOGIA"},
{ AUXILIAR:"CLEUDILENE CLINICA VITORIA",  ramal: "3570",  usuario: "CLEUDILENE VITORIA", status: "ATIVO", setor: "CLINICA VITORIA"},
{ AUXILIAR:"MAGNA CLINICA VITORIA",  ramal: "3571",  usuario: "MAGNA VITORIA", status: "ATIVO", setor: "CLINICA VITORIA"},
{ AUXILIAR:"LUANA CLINICA VITORIA",  ramal: "3574",  usuario: "LUANA VITORIA", status: "ATIVO", setor: "CLINICA VITORIA"},
{ AUXILIAR:"URA PABX",  ramal: "3602",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URA PABX",  ramal: "3605",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URA PABX",  ramal: "3609",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URA PABX",  ramal: "3619",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URA PABX",  ramal: "3620",  usuario: "URA", status: "ATIVO", setor: "PABX"}, 
{ AUXILIAR:"KEILA 2ºANDAR RECEPÇÃO",  ramal: "3559",  usuario: "KEILA ", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"GIRLANE TI",  ramal: "3579",  usuario: "GIRLANE.TI", status: "ATIVO", setor: "T.I"},
{ AUXILIAR:"MARIA IZABEL CLINICA CARIACICA",  ramal: "3580",  usuario: "BEATRIZ CARIACICA", status: "ATIVO", setor: "CLINICA CARIACICA"},
{ AUXILIAR:"WESLEY CLINICA VILA VELHA",  ramal: "3581",  usuario: "HERON VILA VELHA", status: "ATIVO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"LAYANE HELLEN TREINAMENTOS",  ramal: "3582",  usuario: "LAYANE HELLEN", status: "ATIVO", setor: "TREINAMENTOS"},
{ AUXILIAR:"URA PABX",  ramal: "3560",  usuario: "URA", status: "ATIVADO", setor: "PABX"},
{ AUXILIAR:"CRED CREDENCIAMENTO",  ramal: "3625",  usuario: "CRED", status: "ATIVADO", setor: "PABX"},
{ AUXILIAR:"NATHALIA CREDENCIAMENTO",  ramal: "3623",  usuario: "NATHALIA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"URA PABX",  ramal: "3588",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"FILIPI CREDENCIAMENTO",  ramal: "3589",  usuario: "FILIPI", status: "ATIVADO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"KETHLEEN CLINICA VILA VELHA",  ramal: "3576",  usuario: "KETHLEEN VILA VELHA", status: "ATIVADO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"MAGNA FATURAMENTO",  ramal: "3558",  usuario: "MAGNA", status: "ATIVO", setor: "FATURAMENTO"},
{ AUXILIAR:"RAYNNE CLINICA SERRA",  ramal: "3592",  usuario: "AMANDA SERRA", status: "ATIVO", setor: "CLINICA SERRA"},
{ AUXILIAR:"DEBORAH CLINICA SERRA",  ramal: "3593",  usuario: "DEBORAH SERRA", status: "ATIVO", setor: "CLINICA SERRA"},
{ AUXILIAR:"QUEILA CLINICA VILA VELHA",  ramal: "3595",  usuario: "QUEILA VILA VELHA", status: "ATIVO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"URA PABX",  ramal: "3596",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"SABRINNA CLINICA VILA VELHA",  ramal: "3597",  usuario: "MARIA LUIZA VILA VELHA", status: "ATIVO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"CHRISTIAN YASMIN LABORATORIO",  ramal: "3599",  usuario: "CHRISTIAN YASMIN", status: "ATIVO", setor: "LABORATORIO"},
{ AUXILIAR:"URA PABX",  ramal: "3567",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"KEILA UMAP",  ramal: "3618",  usuario: "KEILA", status: "DESATIVADO", setor: "UMAP"},
{ AUXILIAR:"SHARA CREDENCIAMENTO",  ramal: "3577",  usuario: "SHARA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"URAPABX",  ramal: "3572",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"QUEILA VERIDIANA FINANCEIRO",  ramal: "3584",  usuario: "QUEILA VERIDIANA", status: "ATIVO", setor: "FINANCEIRO"},
{ AUXILIAR:"URA PABX",  ramal: "3586",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"GEDALVA FATURAMENTO",  ramal: "3583",  usuario: "GEDALVA", status: "ATIVO", setor: "FATURAMENTO"},
{ AUXILIAR:"ANA PATROCINIO FATURAMENTO",  ramal: "3603",  usuario: "ANA PATROCINIO", status: "ATIVO", setor: "FATURAMENTO"},
{ AUXILIAR:"KEILARECEPÇÃO 2ºANDAR",  ramal: "3551",  usuario: "KEILA 2ºANDAR", status: "ATIVO", setor: "RECEPÇÃO 2ºANDAR"},
{ AUXILIAR:"IZABELLA AREA TECNICA",  ramal: "3555",  usuario: "IZABELLA TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LARISSA CADASTRO",  ramal: "3562",  usuario: "LARISSA", status: "ATIVO", setor: "CADASTRO"},
{ AUXILIAR:"LORENA CADASTRO",  ramal: "3564",  usuario: "LORENA", status: "ATIVO", setor: "CADASTRO"},
{ AUXILIAR:"MARIELE AREA TECNICA",  ramal: "3594",  usuario: "MARIELE TECNICA", status: "DESATIVADO", setor: "AREA TECNICA"},
{ AUXILIAR:"RAIANE E-SOCIAL",  ramal: "3606",  usuario: "RAIANE-SOCIAL", status: "ATIVO", setor: "E-SOCIAL"},
{ AUXILIAR:"SIMONE AUDITORIA",  ramal: "3610",  usuario: "SIMONE", status: "ATIVO", setor: "AUDITORIA"},
{ AUXILIAR:"FLAVIA SALA COORD",  ramal: "3550",  usuario: "FLAVIA SALA COORD", status: "ATIVO", setor: "SALA COORD"},
{ AUXILIAR:"KEILA",  ramal: "3559",  usuario: "KEILA 2ºANDAR", status: "ATIVADO", setor: "AREA TECNICA"},
{ AUXILIAR:"ELY TI",  ramal: "3573",  usuario: "ELY.TI", status: "ATIVO", setor: "T.I"},
{ AUXILIAR:"HENTONNY TI",  ramal: "3578",  usuario: "HENTONNY.TI", status: "ATIVO", setor: "T.I"},
{ AUXILIAR:"JANINE DEPARTAMENTO PESSOAL",  ramal: "3500",  usuario: "JANINE  PESSOAL", status: "ATIVO", setor: "DEPARTAMENTO PESSOAL"},
{ AUXILIAR:"WESLEY CLINICA VILA VELHA",  ramal: "3607",  usuario: "WESLEY VILA VELHA", status: "ATIVO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"URAPABX",  ramal: "3608",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"URAPABX",  ramal: "3587",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"AMANDA CONVENIO",  ramal: "3624",  usuario: "AMANDA", status: "ATIVO", setor: "CONVENIO"},
{ AUXILIAR:"LARISSA MARCHESINI FATURAMENTO",  ramal: "3604",  usuario: "LARISSA MARCHESINI", status: "ATIVADO", setor: "FATURAMENTO"},
{ AUXILIAR:"VITORIA CLINICA  SERRA",  ramal: "3591",  usuario: "VITORIA  SERRA", status: "ATIVO", setor: "CLINICA  SERRA"},
{ AUXILIAR:"CARLOS DIRETORIA",  ramal: "3601",  usuario: "CARLOS", status: "ATIVO", setor: "DIRETORIA"},
{ AUXILIAR:"RAIANE E-SOCIAL",  ramal: "3626",  usuario: "RAIANE-SOCIAL", status: "ATIVO", setor: "E-SOCIAL"},
{ AUXILIAR:"LUDMILA LIBERAÇÃO",  ramal: "3611",  usuario: "LUDMILA", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"FABIANA LIBERAÇÃO",  ramal: "3612",  usuario: "FABIANA", status: "DESATIVADO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"FRANCIELEN LIBERAÇÃO",  ramal: "3613",  usuario: "FRANCIELEN", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"JUNIOR LIBERAÇÃO",  ramal: "3614",  usuario: "JUNIOR", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"DEBORA CREDENCIAMENTO",  ramal: "3622",  usuario: "DEBORA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"MARIANA CREDENCIAMENTO",  ramal: "3621",  usuario: "MARIANA", status: "DESATIVADO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"KLEITON AREA TECNICA",  ramal: "3616",  usuario: "KLEITON TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"ROSE HELLEN LIBERAÇÃO",  ramal: "3590",  usuario: "ROSE HELLEN", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"LUCAS AREA TECNICA",  ramal: "3556",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LUCAS AREA TECNICA",  ramal: "3557",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LUCAS AREA TECNICA",  ramal: "3552",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"ANTONIO AREA TECNICA",  ramal: "3553",  usuario: "LUCINÉIA TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LUCAS AREA TECNICA",  ramal: "3554",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"THAINE COMERCIAL",  ramal: "3629",  usuario: "THAINE", status: "ATIVO", setor: "COMERCIAL"},
{ AUXILIAR:"OSLYAN COMERCIAL",  ramal: "3628",  usuario: "OSLYAN", status: "ATIVO", setor: "COMERCIAL"},
{ AUXILIAR:"SHARA CREDENCIAMENTO",  ramal: "3631",  usuario: "SHARA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"LORENÇA CREDENCIAMENTO",  ramal: "3632",  usuario: "LORENÇA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"ALICIA CREDENCIAMENTO",  ramal: "3633",  usuario: "ALICIA", status: "DESATIVADO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"ALICIA CREDENCIAMENTO",  ramal: "3634",  usuario: "ALICIA", status: "DESATIVADO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"FILIPI CREDENCIAMENTO",  ramal: "3635",  usuario: "FILIPI", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"FABIANA LIBERAÇÃO",  ramal: "3636",  usuario: "FABIANA", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"CHRISTIAN LIBERAÇÃO",  ramal: "3637",  usuario: "CHRISTIAN", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"FABIANA LIBERAÇÃO",  ramal: "3638",  usuario: "FABIANA", status: "DESATIVADO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"FABIANA LIBERAÇÃO",  ramal: "3639",  usuario: "FABIANA", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"URA LIBERAÇÃO",  ramal: "3640",  usuario: "URA", status: "ATIVADO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"VANESSA AREA TECNICA",  ramal: "3617",  usuario: "VANESSA TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{AUXILIAR:"EDRYELLEN COMERCIAL",  ramal: "3607",  usuario: "EDRYELLEN COMERCIAL", status: "ATIVO", setor: "COMERCIAL" 
{AUXILIAR:"VILSON COMERCIAL",  ramal: "3608",  usuario: "VILSON COMERCIAL", status: "ATIVO", setor: "COMERCIAL"
 
]
