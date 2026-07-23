/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RestaurantRequest,
  RestaurantRequestDocument,
} from './schemas/restaurant-request.schema';
import { CreateRestaurantRequestDto } from './dto/create-restaurant-request.dto';
import { UpdateRestaurantRequestDto } from './dto/update-restaurant-request.dto';
import { MailService } from '../mail/mail.service';
import { RestaurantRequestStatus } from './enums/restaurant-request-status.enum';
import { toPlainObject } from '../utils/mongoose.util';

@Injectable()
export class RestaurantRequestService {
  constructor(
    @InjectModel(RestaurantRequest.name)
    private readonly restaurantRequestModel: Model<RestaurantRequestDocument>,
    private readonly mailService: MailService,
  ) {}

  // ─── Create ────────────────────────────────────────────────────────────────

  async create(
    dto: CreateRestaurantRequestDto,
  ): Promise<RestaurantRequestDocument> {
    // Check email uniqueness
    const emailExists = await this.restaurantRequestModel.findOne({
      email: dto.email.toLowerCase().trim(),
      isDeleted: false,
    });
    if (emailExists) {
      throw new ConflictException('A request with this email already exists.');
    }

    // Check phone uniqueness
    const phoneExists = await this.restaurantRequestModel.findOne({
      phone: dto.phone.trim(),
      isDeleted: false,
    });
    if (phoneExists) {
      throw new ConflictException(
        'A request with this phone number already exists.',
      );
    }

    const request = await this.restaurantRequestModel.create(dto);

    const _updatedRequest = request.toJSON();

    // Send confirmation email asynchronously (non-blocking)
    this.mailService
      .sendRestaurantRequestReceived(
        _updatedRequest.email,
        _updatedRequest.name,
        _updatedRequest.restaurantName,
      )
      .catch(() => {});

    return _updatedRequest;
  }

  // ─── Find All (active, non-deleted) ────────────────────────────────────────

  async findAll(): Promise<RestaurantRequestDocument[]> {
    return this.restaurantRequestModel
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── Find One ──────────────────────────────────────────────────────────────

  async findOne(id: string): Promise<any> {
    const request = await this.restaurantRequestModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!request) {
      throw new NotFoundException(
        `Restaurant request with ID "${id}" not found.`,
      );
    }
    return toPlainObject(request);
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  async update(
    id: string,
    dto: UpdateRestaurantRequestDto,
  ): Promise<any> {
    await this.findOne(id); // throws 404 if not found

    // Check email uniqueness if email is being updated
    if (dto.email) {
      const emailExists = await this.restaurantRequestModel.findOne({
        email: dto.email.toLowerCase().trim(),
        _id: { $ne: id },
        isDeleted: false,
      });
      if (emailExists) {
        throw new ConflictException(
          'A request with this email already exists.',
        );
      }
    }

    // Check phone uniqueness if phone is being updated
    if (dto.phone) {
      const phoneExists = await this.restaurantRequestModel.findOne({
        phone: dto.phone.trim(),
        _id: { $ne: id },
        isDeleted: false,
      });
      if (phoneExists) {
        throw new ConflictException(
          'A request with this phone number already exists.',
        );
      }
    }

    const updated = await this.restaurantRequestModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );
    return toPlainObject(updated!);
  }

  // ─── Update Status ─────────────────────────────────────────────────────────

  async updateStatus(
    id: string,
    status: RestaurantRequestStatus,
  ): Promise<any> {
    await this.findOne(id); // throws 404 if not found
    const updated = await this.restaurantRequestModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    );
    return toPlainObject(updated!);
  }

  // ─── Soft Delete ───────────────────────────────────────────────────────────

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id); // throws 404 if not found
    await this.restaurantRequestModel.findByIdAndUpdate(id, {
      $set: { isDeleted: true },
    });
    return { message: `Restaurant request "${id}" deleted successfully.` };
  }
}
