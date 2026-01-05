:::mermaid
graph TD
    subgraph "Application Tier"
        A[Backend: Fastify] -- "console.log(JSON)" --> B(Docker Logging Driver)
        B -- "Write to file" --> C["Host: /var/lib/docker/containers/.../*.log"]
    end

    subgraph "Data Pipeline (The 'Robust' Part)"
        D[Filebeat] -- "1. Collect/Tail" --> C
        D -- "2. Ship (Beats Protocol)" --> E[Logstash]

        subgraph "Transform Phase"
            E -- "3. JSON Filter" --> F{Parsed JSON?}
            F -- "Yes" --> G[Extract: tag, level, message]
            G -- "4. Mutate" --> H[Add Metadata/Tags]
        end
    end

    subgraph "Persistence & Visualization"
        H -- "5. Indexing" --> I[(Elasticsearch)]
        J[Kibana] -- "6. Query & Visualize" --> I
        K[Developer/SRE] -- "7. Monitor Dashboard" --> J
    end

    %% スタイリング
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style I fill:#dfd,stroke:#333,stroke-width:2px
    style J fill:#fff4dd,stroke:#333,stroke-width:2px
:::


- Pattern: filebeat-*

- Primary Fields: @timestamp (Date), level (String), tag (String)

- Storage Strategy: Exported as .ndjson in containers/operation/elk/data_views.ndjson
