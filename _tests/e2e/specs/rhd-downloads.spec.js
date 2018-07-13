import {Home} from "./support/pages/website/Home.page"
import {Login} from './support/pages/keycloak/Login.page'
import {AdditionalInformation} from './support/pages/keycloak/AdditionalInformation.page'
import {ProductOverview} from './support/pages/website/ProductOverview.page'
import {CheatSheets} from './support/pages/website/CheatSheets.page'
import {User} from './support/rest/keycloak/Site.user'
import {DownloadDir} from './support/DownloadDir'
import {Utils} from './support/Utils'

const tags = require('mocha-tags');

describe('Download Manager', function () {
    let downloadDir, downloadSize, siteUser;
    let home, login, additionalInformation;

    beforeEach(function () {
        login = new Login();
        home = new Home();
        additionalInformation = new AdditionalInformation();
        downloadDir = new DownloadDir();
        downloadDir.clear(global.downloadDir)
    });

    afterEach(function () {
        new Utils().logout(process.env.RHD_BASE_URL);
        downloadDir.clear(global.downloadDir)
    });

    tags('sanity', 'dm')
        .it('should allow users to login in and download RHD supportable Products', function () {
            this.retries(2);
            siteUser = new User(process.env.RHD_BASE_URL).rhdAccountDetails();
            let productOverview = new ProductOverview('rhel', 'download', 'Red Hat Enterprise Linux');
            productOverview
                .open();
            productOverview
                .download();
            login
                .awaitLogin();
            login
                .with(siteUser);
            productOverview.awaitDownloadThankYou();
            downloadSize = downloadDir.get();
            expect(downloadSize).to.eq(1);
        });

    tags('dm', 'stage')
        .it('should allow users to login-in and download Red Hat JBoss/Red Hat Developer subscription products', function () {
            this.retries(2);
            siteUser = new User(process.env.RHD_BASE_URL).rhdAccountDetails();
            let productOverview = new ProductOverview('fuse', 'download', 'JBoss Fuse');
            productOverview
                .open();
            productOverview
                .download();
            login
                .awaitLogin();
            login
                .with(siteUser);
            productOverview.awaitDownloadThankYou();
            downloadSize = downloadDir.get();
            expect(downloadSize).to.eq(1);
        });

    tags('dm', 'stage')
        .it('should allow users to login in and download RHD full user profile products', function () {
            this.retries(2);
            siteUser = new User(process.env.RHD_BASE_URL).rhdAccountDetails();
            let productOverview = new ProductOverview('devstudio', 'download', 'JBoss Developer Studio');
            productOverview
                .open();
            productOverview
                .download();
            login
                .awaitLogin();
            login
                .with(siteUser);
            productOverview.awaitDownloadThankYou();
            downloadSize = downloadDir.get();
            expect(downloadSize).to.eq(1);
        });

    tags('dm', 'stage')
        .it('should allow active OpenShift.com account users (simple user account) to login and download RHD supportable user products', function () {
            this.retries(2);
            siteUser = new User(process.env.RHD_BASE_URL).createOpenshiftUser();
            let productOverviewPage = new ProductOverview('rhel', 'download', 'Red Hat Enterprise Linux');
            login
                .open();
            login
                .with(siteUser);
            productOverviewPage
                .open();
            productOverviewPage
                .download();
            productOverviewPage.awaitDownloadThankYou();
            downloadSize = downloadDir.get();
            expect(downloadSize).to.eq(1);
        });

    tags('dm', 'stage')
        .it('should allow active Red Hat Customer Portal account (full user account) users to login and download RHD supportable user products', function () {
            this.retries(2);
            siteUser = new User(process.env.RHD_BASE_URL).createCustomerPortalAccount();
            let productOverviewPage = new ProductOverview('rhel', 'download', 'Red Hat Enterprise Linux');
            login
                .open();
            login
                .with(siteUser.createCustomerPortalAccount());
            additionalInformation
                .complete(siteUser);
            home
                .awaitIsLoggedIn(siteUser.rhdAccountDetails());
            productOverviewPage
                .open();
            productOverviewPage
                .download();
            productOverviewPage
                .awaitDownloadThankYou();
            downloadSize = downloadDir.get();
            expect(downloadSize).to.eq(1);
        });

    tags('sanity', 'dm')
        .it('should allow users to log-in and download promotional cheetsheets', function () {
            this.retries(2);
            let siteUser = new User(process.env.RHD_BASE_URL).rhdAccountDetails();
            let cheatSheet = new CheatSheets('advanced-linux-commands');
            cheatSheet
                .open();
            cheatSheet
                .awaitLoaded();
            cheatSheet
                .clickLoginToDownloadBtn();
            login
                .awaitLogin();
            login
                .with(siteUser);
            home
                .awaitIsLoggedIn(siteUser);
            cheatSheet
                .awaitDownloadThankYou();
            downloadSize = downloadDir.get();
            expect(downloadSize).to.eq(1);
        });
});
