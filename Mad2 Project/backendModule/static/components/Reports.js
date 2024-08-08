export default {
    template: `<div></div>`,

    methods: {
        async getProdBacklogData() {
            const prodbacklogTrigObj = await fetch('/trigger_prodBacklog_job')
            const prodReport = await prodbacklogTrigObj.json()
            if (prodbacklogTrigObj.ok) {
                const backlogJobId = prodReport['prodBacklog_JobId']
                const setJobInterval = setInterval(async () => {
                    const prodReport = await fetch(`/download-productBacklog-data/${backlogJobId}`)
                    if (prodReport.ok) {
                        clearInterval(setJobInterval)
                        window.location.href = `/download-productBacklog-data/${backlogJobId}`
                    }
                }, 1000)
            }
        },
    },

    async mounted() {
        this.getProdBacklogData()
    }

}


