"use strict";

/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  get customerId() {
    return this._customerId;
  }

  set customerId(val) {
    if (this._customerId)
      throw new Error("Cannot reassign customer ID");
    this._customerId = val;
  }

  get numGuests() {
    return this._numGuests;
  }

  set numGuests(val) {
    if (val <= 0)
      throw new Error("Need at least one guest to make a reservation");
    this._numGuests = val;
  }

  get startAt() {
    return this._startAt;
  }
  // what are underscores in this scenario
  set startAt(val) {
    if (isNaN(new Date(val)))
      throw new Error("Must input in valid date format");
    this._startAt = new Date(val);
  }

  get notes() {
    return this._notes;
  }

  set notes(val) {
    if(!val) {
      this._notes = "";
    }
    this._notes = val;
  }

  /** formatter for startAt */

  getFormattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id,
                  customer_id AS "customerId",
                  num_guests AS "numGuests",
                  start_at AS "startAt",
                  notes AS "notes"
           FROM reservations
           WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

  /**Saves a reservation */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations
             SET start_at=$1,
                 num_guests=$2,
                 notes=$3
             WHERE id = $4`, [
        this.startAt,
        this.numGuests,
        this.notes,
        this.id
      ],
      );
    }
  }
}

module.exports = Reservation;
