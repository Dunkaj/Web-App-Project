import UploadCSV from "./upload-csv"
import UploadForm from "./upload-form"
import UploadLeads from "./leads"
import Auth from "./auth"

import { appModels } from "./types"
import config, { IConfig } from "./config"

import EmailCreator from "../models/email-creator/email-creator"
import EmailSenderAbstraction from "../models/emailsender/abstraction"
import EmailSenderNodeMailer from "../models/emailsender/nodemailer"
import EmailSenderConsole from "../models/emailsender/console"
import RestServer from "../rest/index"
import userSyntisize from "./user-syntisize"
import Users from "../models/users/users"
import LeadsModel from "../models/leads/leads"
import LeadsHistoryModel from "../models/leads-history/leads-history"
import NotificationsModel from "../models/notifications/notifications"
import leads from "./leads"
import leadsHistory from "./leads-history"
import notifications from "./notifications"
import TransactionsModel from "../models/transactions/transactions"
import transactions from "./transactions"
import AuctionsModel from "../models/auctions/auctions"
import auctions from "./auctions"
import BetsModel from "../models/bets/bets"
import bets from "./bets"
import ReviewsModel from "../models/reviews/reviews"
import reviews from "./reviews"

import NotFound from "@/utils/not-found.ts"

// console.log("server is ready:", NotFound)

export interface IModels {
  users: Users
  leads: LeadsModel
  leadsHistory: LeadsHistoryModel
  notifications: NotificationsModel
  transactions: TransactionsModel
  auctions: AuctionsModel
  bets: BetsModel
  reviews: ReviewsModel
  emailCreator: EmailCreator
  emailSender: EmailSenderAbstraction
  config: IConfig
}

import SQL from "../models/mysql-pool/mysql-pool"

export default class AppLogic {
  public readonly config = config
  private sql = new SQL(config)

  public models: IModels = {
    users: new Users(this.sql),
    leads: new LeadsModel(this.sql),
    leadsHistory: new LeadsHistoryModel(this.sql),
    notifications: new NotificationsModel(this.sql),
    transactions: new TransactionsModel(this.sql),
    auctions: new AuctionsModel(this.sql),
    bets: new BetsModel(this.sql),
    reviews: new ReviewsModel(this.sql),
    emailCreator: null,
    emailSender: null,
    config: this.config,
  }
  public leads = new leads(this.models)
  public leadsHistory = new leadsHistory(this.models)
  public notifications = new notifications(this.models)
  public transactions = new transactions(this.models)
  public auctions = new auctions(this.models)
  public bets = new bets(this.models)
  public reviews = new reviews(this.models)

  public userSyntisize = userSyntisize

  // private uploadCSV= new UploadCSV()
  private uploadForm = new UploadForm()
  public auth = new Auth(this.models)

  constructor(props?: {
    emailSender?: EmailSenderAbstraction
    emailCreator?: EmailCreator
  }) {
    if (!props) props = {}
    if (props.emailSender) {
      // The caller provider an emailSender provider. Usually by e2e tests
      this.models.emailSender = props.emailSender
    } else {
      // The caller didn't provider an emailSender provider (default)
      switch (config.mail.mailer) {
        case "CONSOLE":
          this.models.emailSender = new EmailSenderConsole()
          break
        case "SMTP":
          this.models.emailSender = new EmailSenderNodeMailer(this.config.mail)
          break

        default:
          throw new Error("do not found emailSender provider")
          break
      }
    }

    if (props.emailCreator) {
      this.models.emailCreator = props.emailCreator
    } else {
      this.models.emailCreator = new EmailCreator({
        backend: this.config.backend,
        frontend: this.config.frontend,
        from: this.config.mail.from,
      })
    }
  }

  createServer = () => {
    var restServer = new RestServer({
      appLogic: this,
      env: "",
      frontend: "",
    })
    var httpServer = restServer.createHttpServer()
    return httpServer
  }

  createServerAndListen() {
    var httpServer = this.createServer()
    httpServer.listen(config.app.port, () => {
      console.log("listening on *:" + config.app.port)
    })
    return httpServer
  }
}
