class DataManager {
    constructor() {
        this.storageKey = 'interaction_manager_data';
    }

    saveData(data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(this.storageKey, jsonData);
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    loadData() {
        try {
            const jsonData = localStorage.getItem(this.storageKey);
            if (!jsonData) {
                return null;
            }
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    clearData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    exportData() {
        const data = this.loadData();
        if (!data) {
            return null;
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interaction_manager_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.saveData(data);
                    resolve(true);
                } catch (error) {
                    console.error('Error importing data:', error);
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
}

export default DataManager; 