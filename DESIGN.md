

                        ProcMan
                          - list
                          - status
                          - reserve_name (init upload)
                          - queue_job (upload)
                          |
                          |
                          |
                       StatusMan
                          |
                          |
                          |
                       Processor
                         - get_streams
                         - read stream info
                         - encode
                         - package
                          
                          
ProcMan => queue_job return jobid
        => add job_details
        => add media id settings POST after reserve_name set configuration

Derive From StatusManFs => override queue_job to use opflow 
                        => transformer => from media settings to opflow



ProcMan
                          - list
                          - status
                          - reserve_name (init upload)
                          - queue_job (upload)
                          |
                          |
                          |
                       StatusMan
                          |\
                          | \
                          |  \
                          |   \
                          |    \
                          |     \
                          |     opflow
                          |
                          |
                       Transformer  <= MEDIA INFO
                                          |
                                          |
                                        MEDIA SETTINGS