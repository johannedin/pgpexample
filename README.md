# pgpexample

## Git configuration
```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"

```

## Testing
In the RestClientTests folder you will find tests.http file. It contains working tests to test key creation, encryption and decryption.

Use 
```bash
func start
```
To start the Azure functions locally

## Barebone approach
:::mermaid

sequenceDiagram
    participant BlobTrigger as Azure Function (BlobTrigger)
    participant BlobStorage as Azure Blob Storage
    participant CsvParser as CSV Parser
    participant Service as TrackTikService

    BlobStorage->>BlobTrigger: CSV file uploaded (contracts_with_parts.csv)
    BlobTrigger->>CsvParser: Read & parse CSV file
    CsvParser->>BlobTrigger: List of Contracts and ContractParts DTOs
    
    loop For each contract
        BlobTrigger->>Service: CreateAsync<Contract>(contract)
        Service-->>BlobTrigger: Return savedContract
    end

    loop For each contract part
        BlobTrigger->>Service: CreateAsync<ContractPart>(contractPart)
        Service-->>BlobTrigger: Return savedContractPart
    end

    BlobTrigger->>BlobStorage: Delete processed file (optional)
:::

**Barebones Approach: Pros & Cons**
✅ Pros:

Simple & straightforward – No orchestration or queues, just direct processing.
Low latency – Contracts and contract parts are processed immediately.
Easier debugging – Everything happens sequentially in one function.
❌ Cons:

Not scalable – Large files may cause function timeouts or high execution time.
Blocking execution – The function must complete all processing before finishing.
No retry mechanism – If a failure occurs, the whole process might need to restart manually.


## Durable Function approach

:::mermaid
sequenceDiagram
    participant BlobTrigger as Azure Function (BlobTrigger)
    participant Orchestrator as Durable Orchestration Function
    participant ParseCsvActivity as Activity: Parse CSV
    participant SaveContractActivity as Activity: Save Contract
    participant SaveContractPartActivity as Activity: Save ContractPart
    participant Service as TrackTikService
    participant BlobStorage as Azure Blob Storage

    BlobStorage->>BlobTrigger: CSV file uploaded (contracts_with_parts.csv)
    BlobTrigger->>Orchestrator: StartOrchestration(filePath)
    
    Orchestrator->>ParseCsvActivity: Parse CSV file
    ParseCsvActivity->>Orchestrator: Return contracts and contract parts DTOs

    loop For each contract
        Orchestrator->>SaveContractActivity: SaveContract(contract)
        SaveContractActivity->>Service: CreateAsync<Contract>(contract)
        Service-->>SaveContractActivity: Return savedContract
        SaveContractActivity-->>Orchestrator: Return savedContract
    end

    loop For each contract part
        Orchestrator->>SaveContractPartActivity: SaveContractPart(contractPart)
        SaveContractPartActivity->>Service: CreateAsync<ContractPart>(contractPart)
        Service-->>SaveContractPartActivity: Return savedContractPart
        SaveContractPartActivity-->>Orchestrator: Return savedContractPart
    end

    Orchestrator->>BlobStorage: Delete processed file (optional)
    Orchestrator-->>BlobTrigger: Processing complete

:::

** Durable Functions Approach: Pros & Cons **
✅ Pros:

- Scalable – Workflows can process large files efficiently by handling contracts and parts in parallel.
- Resilient – Automatic retries and state management ensure processing continues even if failures occur.
- Efficient Resource Utilization – Functions scale independently, reducing long-running execution costs.
- Better observability – Execution history is tracked via Durable Task Framework.

❌ Cons:

- Increased complexity – More components (orchestrator + activity functions) require additional development effort.
- Higher latency – Processing steps are executed in separate functions, adding orchestration overhead.
- State management overhead – Durable Functions need storage (Azure Storage Tables) to track execution state.

:::mermaid
sequenceDiagram
    participant BlobTrigger as Azure Function (BlobTrigger)
    participant Orchestrator as Durable Orchestration Function
    participant ParseCsvActivity as Activity: Parse CSV
    participant ServiceBusQueue as Azure Service Bus Queue
    participant QueueTrigger as Azure Function (QueueTrigger)
    participant Service as TrackTikService
    participant BlobStorage as Azure Blob Storage

    BlobStorage->>BlobTrigger: CSV file uploaded (contracts_with_parts.csv)
    BlobTrigger->>Orchestrator: StartOrchestration(filePath)
    
    Orchestrator->>ParseCsvActivity: Parse CSV file and merge contracts with contract parts
    ParseCsvActivity->>Orchestrator: Return list of merged contract DTOs
    
    loop For each contract
        Orchestrator->>ServiceBusQueue: Send mergedContract to queue
    end

    Orchestrator->>BlobStorage: Delete processed file (optional)
    Orchestrator-->>BlobTrigger: Processing complete

    loop Queue-triggered contract processing
        ServiceBusQueue->>QueueTrigger: Receive mergedContract from queue
        QueueTrigger->>Service: CreateAsync<Contract>(mergedContract)
        Service-->>QueueTrigger: Return savedContract
    end

:::

**Service Bus Queue Approach: Pros & Cons**
✅ Pros:

- Highly Scalable – Contracts are processed asynchronously, allowing high throughput.
- Decoupled Processing – Blob parsing and contract saving happen separately, improving maintainability.
- Resilient & Reliable – Service Bus ensures messages are delivered even if the function fails, with built-in retries.
- Parallel Execution – Multiple queue-triggered functions can run concurrently, speeding up processing.
❌ Cons:

- Increased Latency – Contracts are queued and processed asynchronously, adding potential delays.
- Additional Infrastructure Required – Service Bus must be set up and managed.
- More Moving Parts – The system has multiple components (queue, trigger function, service), increasing complexity.

**Comparison Summary**
| Approach         | Scalability | Resilience | Complexity | Latency |
|-----------------|------------|------------|------------|---------|
| **Barebones**   | ❌ Low     | ❌ Low     | ✅ Simple  | ✅ Low  |
| **Durable**     | ✅ High    | ✅ High    | 🔸 Medium | 🔸 Medium |
| **Service Bus** | ✅ High    | ✅ High    | 🔸 Medium | ❌ Higher |

🚀 Recommendation:

Use Barebones if the file size is small and real-time processing is required.
Use Durable Functions for a structured, scalable approach with better retry logic.
Use Service Bus for high-volume workloads needing independent, asynchronous contract processing.