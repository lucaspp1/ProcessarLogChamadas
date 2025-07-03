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
            formatProcessContent(element);
        }
    }
    return ExportDataRow();
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
        exportFormat.inicio,
        exportFormat.fim,
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

function formatProcessContent(content) {

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
const undStr = "ind"

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
{ AUXILIAR:"MARIA LUIZA\RAYSSAGUARAPARI",  ramal: "3800",  usuario: "MILENA\RAYSSA", status: "ATIVO", setor: "GUARAPARI"},
{ AUXILIAR:"URAPABX",  ramal: "3600",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URACOMERCIAL",  ramal: "3630",  usuario: "URA", status: "ATIVO", setor: "COMERCIAL"},
{ AUXILIAR:"FLAVIAPISICOLOGIA",  ramal: "3561",  usuario: "FLAVIA", status: "ATIVO", setor: "PISICOLOGIA"},
{ AUXILIAR:"CLEUDILENECLINICA VITORIA",  ramal: "3570",  usuario: "CLEUDILENE VITORIA", status: "ATIVO", setor: "CLINICA VITORIA"},
{ AUXILIAR:"GABRIELCLINICA VITORIA",  ramal: "3571",  usuario: "GABRIEL VITORIA", status: "ATIVO", setor: "CLINICA VITORIA"},
{ AUXILIAR:"LUANACLINICA VITORIA",  ramal: "3574",  usuario: "LUANA VITORIA", status: "ATIVO", setor: "CLINICA VITORIA"},
{ AUXILIAR:"URAPABX",  ramal: "3602",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URAPABX",  ramal: "3605",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URAPABX",  ramal: "3609",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URAPABX",  ramal: "3619",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"URAPABX",  ramal: "3620",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"GIRLANET.TI",  ramal: "3579",  usuario: "GIRLANE.I", status: "ATIVO", setor: "T.I"},
{ AUXILIAR:"MARIA IZABELCLINICA CARIACICA",  ramal: "3580",  usuario: "BEATRIZ CARIACICA", status: "ATIVO", setor: "CLINICA CARIACICA"},
{ AUXILIAR:"WESLEYCLINICA VILA VELHA",  ramal: "3581",  usuario: "HERON VILA VELHA", status: "ATIVO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"LAYANE\HELLENTREINAMENTOS",  ramal: "3582",  usuario: "LAYANE\HELLEN", status: "ATIVO", setor: "TREINAMENTOS"},
{ AUXILIAR:"URAPABX",  ramal: "3560",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"URAPABX",  ramal: "3625",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"NATHALIACREDENCIAMENTO",  ramal: "3623",  usuario: "NATHALIA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"URAPABX",  ramal: "3588",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"FILIPICREDENCIAMENTO",  ramal: "3589",  usuario: "FILIPI", status: "DESATIVADO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"HERONCLINICA VILA VELHA",  ramal: "3576",  usuario: "HERON VILA VELHA", status: "DESATIVADO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"PRISCILAFATURAMENTO",  ramal: "3558",  usuario: "PRISCILA", status: "ATIVO", setor: "FATURAMENTO"},
{ AUXILIAR:"RANIELLICLINICA SERRA",  ramal: "3592",  usuario: "AMANDA SERRA", status: "ATIVO", setor: "CLINICA SERRA"},
{ AUXILIAR:"DEBORAHCLINICA SERRA",  ramal: "3593",  usuario: "DEBORAH SERRA", status: "ATIVO", setor: "CLINICA SERRA"},
{ AUXILIAR:"QUEILACLINICA VILA VELHA",  ramal: "3595",  usuario: "QUEILA VILA VELHA", status: "ATIVO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"URAPABX",  ramal: "3596",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"SABRINNACLINICA VILA VELHA",  ramal: "3597",  usuario: "MARIA LUIZA VILA VELHA", status: "ATIVO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"CHRISTIAN\YASMINLABORATORIO",  ramal: "3599",  usuario: "CHRISTIAN\YASMIN", status: "ATIVO", setor: "LABORATORIO"},
{ AUXILIAR:"URAPABX",  ramal: "3567",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"KEILAUMAP",  ramal: "3618",  usuario: "KEILA", status: "DESATIVADO", setor: "UMAP"},
{ AUXILIAR:"SHARACREDENCIAMENTO",  ramal: "3577",  usuario: "SHARA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"URAPABX",  ramal: "3572",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"QUEILA \ VERIDIANAFINANCEIRO",  ramal: "3584",  usuario: "QUEILA \ VERIDIANA", status: "ATIVO", setor: "FINANCEIRO"},
{ AUXILIAR:"URAPABX",  ramal: "3586",  usuario: "URA", status: "ATIVO", setor: "PABX"},
{ AUXILIAR:"GEDALVAFATURAMENTO",  ramal: "3583",  usuario: "GEDALVA", status: "ATIVO", setor: "FATURAMENTO"},
{ AUXILIAR:"ANA PATROCINIOFATURAMENTO",  ramal: "3603",  usuario: "ANA PATROCINIO", status: "ATIVO", setor: "FATURAMENTO"},
{ AUXILIAR:"KEILARECEPÇÃO 2ºANDAR",  ramal: "3551",  usuario: "MARIA IZABEL 2ºANDAR", status: "ATIVO", setor: "RECEPÇÃO 2ºANDAR"},
{ AUXILIAR:"LUCASAREA TECNICA",  ramal: "3555",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LARISSACADASTRO",  ramal: "3562",  usuario: "LARISSA", status: "ATIVO", setor: "CADASTRO"},
{ AUXILIAR:"LORENACADASTRO",  ramal: "3564",  usuario: "LORENA", status: "ATIVO", setor: "CADASTRO"},
{ AUXILIAR:"LUCASAREA TECNICA",  ramal: "3594",  usuario: "LUCAS TECNICA", status: "DESATIVADO", setor: "AREA TECNICA"},
{ AUXILIAR:"RAIANEE-SOCIAL",  ramal: "3606",  usuario: "RAIANE-SOCIAL", status: "ATIVO", setor: "E-SOCIAL"},
{ AUXILIAR:"SIMONEAUDITORIA",  ramal: "3610",  usuario: "SIMONE", status: "ATIVO", setor: "AUDITORIA"},
{ AUXILIAR:"KEILARECEPÇÃO 2ºANDAR",  ramal: "3550",  usuario: "MARIA IZABEL 2ºANDAR", status: "ATIVO", setor: "RECEPÇÃO 2ºANDAR"},
{ AUXILIAR:"LUCASAREA TECNICA",  ramal: "3559",  usuario: "LUCAS TECNICA", status: "DESATIVADO", setor: "AREA TECNICA"},
{ AUXILIAR:"ELYT.TI",  ramal: "3573",  usuario: "ELY.I", status: "ATIVO", setor: "T.I"},
{ AUXILIAR:"HENTONNYT.TI",  ramal: "3578",  usuario: "HENTONNY.I", status: "ATIVO", setor: "T.I"},
{ AUXILIAR:"JANINE DEPARTAMENTO PESSOAL",  ramal: "3500",  usuario: "JANINE  PESSOAL", status: "ATIVO", setor: "DEPARTAMENTO PESSOAL"},
{ AUXILIAR:"HERONCLINICA VILA VELHA",  ramal: "3607",  usuario: "HERON VILA VELHA", status: "ATIVO", setor: "CLINICA VILA VELHA"},
{ AUXILIAR:"URAPABX",  ramal: "3608",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"URAPABX",  ramal: "3587",  usuario: "URA", status: "DESATIVADO", setor: "PABX"},
{ AUXILIAR:"AMANDACONVENIO",  ramal: "3624",  usuario: "AMANDA", status: "ATIVO", setor: "CONVENIO"},
{ AUXILIAR:"FERNANDAFATURAMENTO",  ramal: "3604",  usuario: "FERNANDA", status: "DESATIVADO", setor: "FATURAMENTO"},
{ AUXILIAR:"VITORIACLINICA  SERRA",  ramal: "3591",  usuario: "VITORIA  SERRA", status: "ATIVO", setor: "CLINICA  SERRA"},
{ AUXILIAR:"CARLOSDIRETORIA",  ramal: "3601",  usuario: "CARLOS", status: "ATIVO", setor: "DIRETORIA"},
{ AUXILIAR:"RAIANEE-SOCIAL",  ramal: "3626",  usuario: "RAIANE-SOCIAL", status: "ATIVO", setor: "E-SOCIAL"},
{ AUXILIAR:"LUDMILALIBERAÇÃO",  ramal: "3611",  usuario: "LUDMILA", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"FABIANALIBERAÇÃO",  ramal: "3612",  usuario: "FABIANA", status: "DESATIVADO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"FRANCIELENLIBERAÇÃO",  ramal: "3613",  usuario: "FRANCIELEN", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"JUNIORLIBERAÇÃO",  ramal: "3614",  usuario: "JUNIOR", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"DEBORACREDENCIAMENTO",  ramal: "3622",  usuario: "DEBORA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"MARIANACREDENCIAMENTO",  ramal: "3621",  usuario: "MARIANA", status: "DESATIVADO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"KLEITONAREA TECNICA",  ramal: "3616",  usuario: "KLEITON TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"ROSE HELLENLIBERAÇÃO",  ramal: "3590",  usuario: "ROSE HELLEN", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"LUCASAREA TECNICA",  ramal: "3556",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LUCASAREA TECNICA",  ramal: "3557",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LUCASAREA TECNICA",  ramal: "3552",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LUCINÉIAAREA TECNICA",  ramal: "3553",  usuario: "LUCINÉIA TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"LUCASAREA TECNICA",  ramal: "3554",  usuario: "LUCAS TECNICA", status: "ATIVO", setor: "AREA TECNICA"},
{ AUXILIAR:"THAINECOMERCIAL",  ramal: "3629",  usuario: "THAINE", status: "ATIVO", setor: "COMERCIAL"},
{ AUXILIAR:"OSLYANCOMERCIAL",  ramal: "3628",  usuario: "OSLYAN", status: "ATIVO", setor: "COMERCIAL"},
{ AUXILIAR:"SHARACREDENCIAMENTO",  ramal: "3631",  usuario: "SHARA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"LORENÇACREDENCIAMENTO",  ramal: "3632",  usuario: "LORENÇA", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"PAMÊLACREDENCIAMENTO",  ramal: "3633",  usuario: "PAMÊLA", status: "DESATIVADO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"ALICIACREDENCIAMENTO",  ramal: "3634",  usuario: "ALICIA", status: "DESATIVADO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"FILIPICREDENCIAMENTO",  ramal: "3635",  usuario: "FILIPI", status: "ATIVO", setor: "CREDENCIAMENTO"},
{ AUXILIAR:"FABIANALIBERAÇÃO",  ramal: "3636",  usuario: "FABIANA", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"CHRISTIANLIBERAÇÃO",  ramal: "3637",  usuario: "CHRISTIAN", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"FABIANALIBERAÇÃO",  ramal: "3638",  usuario: "FABIANA", status: "DESATIVADO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"FABIANALIBERAÇÃO",  ramal: "3639",  usuario: "FABIANA", status: "ATIVO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"URALIBERAÇÃO",  ramal: "3640",  usuario: "URA", status: "DESATIVADO", setor: "LIBERAÇÃO"},
{ AUXILIAR:"MARINAAREA TECNICA",  ramal: "3617",  usuario: "MARINA TECNICA", status: "ATIVO", setor: "AREA TECNICA"},

]
