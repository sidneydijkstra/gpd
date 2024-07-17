import { useGenerateApi } from "../useGenerateApi.mjs";

export function getTransaction(pipelineGuid, transactionGuid){
    const client = useGenerateApi("http://localhost:3000/api", {
        headers: {
            "Content-Type": "application/json",
        },
    });

    return client.pipeline[`${pipelineGuid}`].transaction[`${transactionGuid}`].get();
}

export function getTransactionTasks(pipelineGuid, transactionGuid){
    const client = useGenerateApi("http://localhost:3000/api", {
        headers: {
            "Content-Type": "application/json",
        },
    });

    return client.pipeline[`${pipelineGuid}`].transaction[`${transactionGuid}`].task.get();
}