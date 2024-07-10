import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import ConfirmationService from 'primevue/confirmationservice';
import ConfirmPopup from 'primevue/confirmpopup';
import ConfirmDialog from 'primevue/confirmdialog';

import Button from "primevue/button"
import Card from 'primevue/card';
import InputText from "primevue/inputtext"
import Badge from "primevue/badge"
import Menubar from 'primevue/menubar';
import PanelMenu from 'primevue/panelmenu';
import Menu from 'primevue/menu';
import DataView from 'primevue/dataview';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import SplitButton from 'primevue/splitbutton';
import ProgressSpinner from 'primevue/progressspinner';
import Panel from 'primevue/panel';
import Textarea from 'primevue/textarea';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

export default {
    install: (app) => {
        app.use(PrimeVue, {
            theme: {
                preset: Aura,
            }
        });
        
        app.use(ConfirmationService);
        app.component("ConfirmPopup", ConfirmPopup);
        app.component("ConfirmDialog", ConfirmDialog);

        app.component("Button", Button);
        app.component("Card", Card);
        app.component("InputText", InputText);
        app.component("Badge", Badge);
        app.component("Menubar", Menubar);
        app.component("PanelMenu", PanelMenu);
        app.component("Menu", Menu);
        app.component("DataView", DataView);
        app.component("Column", Column);
        app.component("DataTable", DataTable);
        app.component("SplitButton", SplitButton);
        app.component("ProgressSpinner", ProgressSpinner);
        app.component("Panel", Panel);
        app.component("Textarea", Textarea);
        app.component("InputGroup", InputGroup);
        app.component("InputGroupAddon", InputGroupAddon);
    }
}