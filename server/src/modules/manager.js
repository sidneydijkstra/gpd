
const agents = []

export function addAgent(agent){
    agents.push({
        guid: agent.guid,
        name: agent.name,
        version: agent.version,
        running: false
    })

    console.log(`[manager] Added agent: ${JSON.stringify(agent)}`)
}

export function removeAgent(name){
    agents.splice(agents.findIndex(x => x.name == name), 1)
    console.log(`[manager] Removed agent: ${name}`)
}

export function getAllAgents(){
    return agents
}

export function getAgent(name){
    return agents.find(x => x.name == name)
}

export function getAvailableAgent(){
    return agents.filter(x => !x.running)
}

export function getAnyAgent(){
    return agents.length > 0 ? agents[0] : null
}

export function updateAgent(name, running){
    var agent = agents.find(x => x.name == name)
    if(agent != null)
        agent.running = running
}

export function isAnyAgentAvailable(){
    return agents.length > 0
}

export function containsAgent(name){
    return agents.find(x => x.name == name) != null
}