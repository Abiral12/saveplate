import "server-only";

import {
  DonationListingStatus,
  DonationRequestStatus,
  FoodItemStatus,
  Prisma,
} from "@/app/generated/prisma/client";

import { ApiError } from "@/lib/api/api";
import { prisma } from "@/lib/db/prisma";

import type {
  BrowseDonationsQuery,
  CreateDonationInput,
  CreateDonationRequestInput,
  DonationRequestActionInput,
  MyRequestsQuery,
  OwnDonationsQuery,
  UpdateDonationInput,
} from "./donation.schemas";

const foodItemSelect = {
  id: true,
  itemName: true,
  quantity: true,
  unit: true,
  category: true,
  expiryDate: true,
  storageLocation: true,
  status: true,
  notes: true,
} satisfies Prisma.FoodItemSelect;

const ownListingSelect = {
  id: true,
  pickupLocation: true,
  availabilityDetails: true,
  notes: true,
  status: true,
  cancelledAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,

  foodItem: {
    select: foodItemSelect,
  },

  requests: {
    orderBy: {
      createdAt: "desc",
    },

    take: 25,

    select: {
      id: true,
      message: true,
      status: true,
      respondedAt: true,
      claimedAt: true,
      cancelledAt: true,
      createdAt: true,
      updatedAt: true,

      requester: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  },
} satisfies Prisma.DonationListingSelect;

const requestSelect = {
  id: true,
  message: true,
  status: true,
  respondedAt: true,
  claimedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,

  listing: {
    select: {
      id: true,
      status: true,
      pickupLocation: true,
      availabilityDetails: true,
      notes: true,
      createdAt: true,

      donor: {
        select: {
          id: true,
          fullName: true,
        },
      },

      foodItem: {
        select: foodItemSelect,
      },
    },
  },
} satisfies Prisma.DonationRequestSelect;

type OwnListingRow =
  Prisma.DonationListingGetPayload<{
    select: typeof ownListingSelect;
  }>;

type RequestRow =
  Prisma.DonationRequestGetPayload<{
    select: typeof requestSelect;
  }>;

const DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000;

function startOfTodayUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

function addDays(
  date: Date,
  days: number,
) {
  const result = new Date(date);

  result.setUTCDate(
    result.getUTCDate() + days,
  );

  return result;
}

function normalizeText(
  value: string,
) {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

function mapFoodItem(
  item: OwnListingRow["foodItem"],
) {
  const today =
    startOfTodayUtc().getTime();

  const expiry =
    item.expiryDate.getTime();

  const daysUntilExpiry =
    Math.ceil(
      (expiry - today) /
        DAY_IN_MILLISECONDS,
    );

  return {
    id: item.id,
    itemName: item.itemName,
    quantity: Number(item.quantity),
    unit: item.unit,
    category: item.category,
    expiryDate:
      item.expiryDate
        .toISOString()
        .slice(0, 10),
    storageLocation:
      item.storageLocation,
    status: item.status,
    notes: item.notes,
    isExpired:
      daysUntilExpiry < 0,
    isExpiringSoon:
      daysUntilExpiry >= 0 &&
      daysUntilExpiry <= 7,
    daysUntilExpiry,
  };
}

function mapOwnListing(
  listing: OwnListingRow,
) {
  const foodItem =
    mapFoodItem(listing.foodItem);

  const effectiveStatus =
    listing.status ===
      DonationListingStatus.AVAILABLE &&
    foodItem.isExpired
      ? DonationListingStatus.EXPIRED
      : listing.status;

  return {
    id: listing.id,
    pickupLocation:
      listing.pickupLocation,
    availabilityDetails:
      listing.availabilityDetails,
    notes: listing.notes,
    status: effectiveStatus,
    storedStatus: listing.status,
    cancelledAt:
      listing.cancelledAt?.toISOString() ??
      null,
    completedAt:
      listing.completedAt?.toISOString() ??
      null,
    createdAt:
      listing.createdAt.toISOString(),
    updatedAt:
      listing.updatedAt.toISOString(),
    foodItem,

    requests:
      listing.requests.map(
        (request) => ({
          id: request.id,
          message: request.message,
          status: request.status,
          respondedAt:
            request.respondedAt?.toISOString() ??
            null,
          claimedAt:
            request.claimedAt?.toISOString() ??
            null,
          cancelledAt:
            request.cancelledAt?.toISOString() ??
            null,
          createdAt:
            request.createdAt.toISOString(),
          updatedAt:
            request.updatedAt.toISOString(),
          requester:
            request.requester,
        }),
      ),
  };
}

function mapRequest(
  request: RequestRow,
) {
  return {
    id: request.id,
    message: request.message,
    status: request.status,
    respondedAt:
      request.respondedAt?.toISOString() ??
      null,
    claimedAt:
      request.claimedAt?.toISOString() ??
      null,
    cancelledAt:
      request.cancelledAt?.toISOString() ??
      null,
    createdAt:
      request.createdAt.toISOString(),
    updatedAt:
      request.updatedAt.toISOString(),

    listing: {
      id: request.listing.id,
      status: request.listing.status,
      pickupLocation:
        request.listing.pickupLocation,
      availabilityDetails:
        request.listing
          .availabilityDetails,
      notes: request.listing.notes,
      createdAt:
        request.listing.createdAt.toISOString(),
      donor:
        request.listing.donor,
      foodItem:
        mapFoodItem(
          request.listing.foodItem,
        ),
    },
  };
}

async function withSerializableRetry<T>(
  operation: (
    transaction: Prisma.TransactionClient,
  ) => Promise<T>,
): Promise<T> {
  const maximumAttempts = 3;

  for (
    let attempt = 1;
    attempt <= maximumAttempts;
    attempt += 1
  ) {
    try {
      return await prisma.$transaction(
        operation,
        {
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,
          maxWait: 5000,
          timeout: 10000,
        },
      );
    } catch (error) {
      const isWriteConflict =
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";

      if (
        !isWriteConflict ||
        attempt === maximumAttempts
      ) {
        throw error;
      }
    }
  }

  throw new ApiError(
    409,
    "The action could not be completed because the record changed.",
  );
}

export async function getEligibleDonationItemsService(
  userId: string,
) {
  const items =
    await prisma.foodItem.findMany({
      where: {
        userId,
        status: FoodItemStatus.AVAILABLE,
        expiryDate: {
          gte: startOfTodayUtc(),
        },
      },

      orderBy: [
        {
          expiryDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],

      select: foodItemSelect,
    });

  return items.map((item) =>
    mapFoodItem(item),
  );
}

export async function createDonationService(
  donorId: string,
  input: CreateDonationInput,
) {
  try {
    const listing =
      await withSerializableRetry(
        async (transaction) => {
          const reservedItem =
            await transaction.foodItem.updateMany({
             where: {
  id: input.foodItemId,
  userId: donorId,

                status:
                  FoodItemStatus.AVAILABLE,
                expiryDate: {
                  gte: startOfTodayUtc(),
                },
              },

              data: {
                status:
                  FoodItemStatus.RESERVED,
              },
            });

          if (reservedItem.count !== 1) {
            const item =
              await transaction.foodItem.findFirst({
                where: {
  id: input.foodItemId,
  userId: donorId,
},

                select: {
                  id: true,
                  status: true,
                  expiryDate: true,
                },
              });

            if (!item) {
              throw new ApiError(
                404,
                "Food item was not found.",
              );
            }

            if (
              item.expiryDate.getTime() <
              startOfTodayUtc().getTime()
            ) {
              throw new ApiError(
                409,
                "Expired food cannot be donated.",
              );
            }

            throw new ApiError(
              409,
              "Only available food items can be donated.",
            );
          }

          return transaction
            .donationListing
            .create({
              data: {
                foodItemId:
                  input.foodItemId,
                donorId,

                pickupLocation:
                  normalizeText(
                    input.pickupLocation,
                  ),

                availabilityDetails:
                  normalizeText(
                    input.availabilityDetails,
                  ),

                notes:
                  input.notes ?? null,

                status:
                  DonationListingStatus.AVAILABLE,
              },

              select:
                ownListingSelect,
            });
        },
      );

    return mapOwnListing(listing);
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        409,
        "This food item already has an active donation listing.",
      );
    }

    throw error;
  }
}

export async function getOwnDonationsService(
  donorId: string,
  query: OwnDonationsQuery,
) {
  const where:
    Prisma.DonationListingWhereInput = {
      donorId,
    };

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      {
        foodItem: {
          is: {
            itemName: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        pickupLocation: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const skip =
    (query.page - 1) *
    query.size;

  const [items, total] =
    await prisma.$transaction([
      prisma.donationListing.findMany({
        where,
        select: ownListingSelect,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: query.size,
      }),

      prisma.donationListing.count({
        where,
      }),
    ]);

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(
          total / query.size,
        );

  return {
    items:
      items.map(mapOwnListing),

    pagination: {
      page: query.page,
      size: query.size,
      totalItems: total,
      totalPages,
      hasNext:
        query.page < totalPages,
      hasPrevious:
        query.page > 1,
    },
  };
}

export async function getOwnDonationByIdService(
  donorId: string,
  listingId: string,
) {
  const listing =
    await prisma.donationListing.findFirst({
      where: {
        id: listingId,
        donorId,
      },
      select: ownListingSelect,
    });

  if (!listing) {
    throw new ApiError(
      404,
      "Donation listing was not found.",
    );
  }

  return mapOwnListing(listing);
}

async function cancelDonationListing(
  donorId: string,
  listingId: string,
) {
  return withSerializableRetry(
    async (transaction) => {
      const listing =
        await transaction
          .donationListing
          .findFirst({
            where: {
              id: listingId,
              donorId,
            },

            select: {
              id: true,
              status: true,
              foodItemId: true,
            },
          });

      if (!listing) {
        throw new ApiError(
          404,
          "Donation listing was not found.",
        );
      }

      if (
        listing.status ===
          DonationListingStatus.COMPLETED ||
        listing.status ===
          DonationListingStatus.CANCELLED
      ) {
        throw new ApiError(
          409,
          "This donation listing can no longer be cancelled.",
        );
      }

      if (
        listing.status ===
        DonationListingStatus.RESERVED
      ) {
        throw new ApiError(
          409,
          "A donation with an accepted request cannot be cancelled.",
        );
      }

      await transaction
        .donationListing
        .update({
          where: {
            id: listing.id,
          },

          data: {
            status:
              DonationListingStatus.CANCELLED,
            cancelledAt:
              new Date(),
          },
        });

      await transaction
        .donationRequest
        .updateMany({
          where: {
            listingId:
              listing.id,
            status:
              DonationRequestStatus.PENDING,
          },

          data: {
            status:
              DonationRequestStatus.CANCELLED,
            cancelledAt:
              new Date(),
          },
        });

      await transaction
        .foodItem
        .updateMany({
          where: {
            id: listing.foodItemId,
            userId: donorId,
            status:
              FoodItemStatus.RESERVED,
          },

          data: {
            status:
              FoodItemStatus.AVAILABLE,
          },
        });

      return transaction
        .donationListing
        .findUniqueOrThrow({
          where: {
            id: listing.id,
          },
          select: ownListingSelect,
        });
    },
  );
}

export async function updateDonationService(
  donorId: string,
  listingId: string,
  input: UpdateDonationInput,
) {
  if ("action" in input) {
    const listing =
      await cancelDonationListing(
        donorId,
        listingId,
      );

    return mapOwnListing(listing);
  }

  const existing =
    await prisma.donationListing.findFirst({
      where: {
        id: listingId,
        donorId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!existing) {
    throw new ApiError(
      404,
      "Donation listing was not found.",
    );
  }

  if (
    existing.status !==
    DonationListingStatus.AVAILABLE
  ) {
    throw new ApiError(
      409,
      "Only available donation listings can be edited.",
    );
  }

  const listing =
    await prisma.donationListing.update({
      where: {
        id: existing.id,
      },

      data: {
        pickupLocation:
          input.pickupLocation ===
          undefined
            ? undefined
            : normalizeText(
                input.pickupLocation,
              ),

        availabilityDetails:
          input.availabilityDetails ===
          undefined
            ? undefined
            : normalizeText(
                input.availabilityDetails,
              ),

        notes:
          input.notes,
      },

      select: ownListingSelect,
    });

  return mapOwnListing(listing);
}


function browseListingSelect(
  requesterId: string,
) {
  return {
    id: true,
    pickupLocation: true,
    availabilityDetails: true,
    notes: true,
    status: true,
    createdAt: true,
    updatedAt: true,

    donor: {
      select: {
        id: true,
        fullName: true,
      },
    },

    foodItem: {
      select: foodItemSelect,
    },

    requests: {
      where: {
        requesterId,
      },

      take: 1,

      select: {
        id: true,
        status: true,
        message: true,
        createdAt: true,
      },
    },

    _count: {
      select: {
        requests: true,
      },
    },
  } satisfies Prisma.DonationListingSelect;
}

export async function browseDonationsService(
  requesterId: string,
  query: BrowseDonationsQuery,
) {
  const today =
    startOfTodayUtc();

  const foodWhere:
    Prisma.FoodItemWhereInput = {
      status:
        FoodItemStatus.RESERVED,

      expiryDate: {
        gte: today,
      },
    };

  if (query.category) {
    foodWhere.category =
      query.category;
  }

  if (query.expiry === "soon") {
    foodWhere.expiryDate = {
      gte: today,
      lte: addDays(today, 7),
    };
  }

  if (query.expiry === "later") {
    foodWhere.expiryDate = {
      gt: addDays(today, 7),
    };
  }

  const where:
    Prisma.DonationListingWhereInput = {
      donorId: {
        not: requesterId,
      },

      status:
        DonationListingStatus.AVAILABLE,

      foodItem: {
        is: foodWhere,
      },
    };

  if (query.location) {
    where.pickupLocation = {
      contains: query.location,
      mode: "insensitive",
    };
  }

  if (query.search) {
    where.OR = [
      {
        foodItem: {
          is: {
            ...foodWhere,

            itemName: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        pickupLocation: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        notes: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const skip =
    (query.page - 1) *
    query.size;

  const select =
    browseListingSelect(
      requesterId,
    );

  const [items, total] =
    await prisma.$transaction([
      prisma.donationListing.findMany({
        where,
        select,
        orderBy: [
          {
            foodItem: {
              expiryDate: "asc",
            },
          },
          {
            createdAt: "desc",
          },
        ],
        skip,
        take: query.size,
      }),

      prisma.donationListing.count({
        where,
      }),
    ]);

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(
          total / query.size,
        );

  return {
    items:
      items.map((listing) => ({
        id: listing.id,
        pickupLocation:
          listing.pickupLocation,
        availabilityDetails:
          listing.availabilityDetails,
        notes: listing.notes,
        status: listing.status,
        createdAt:
          listing.createdAt.toISOString(),
        updatedAt:
          listing.updatedAt.toISOString(),
        donor: listing.donor,
        foodItem:
          mapFoodItem(
            listing.foodItem,
          ),
        requestCount:
          listing._count.requests,
        currentRequest:
          listing.requests[0]
            ? {
                ...listing.requests[0],
                createdAt:
                  listing.requests[0]
                    .createdAt
                    .toISOString(),
              }
            : null,
      })),

    pagination: {
      page: query.page,
      size: query.size,
      totalItems: total,
      totalPages,
      hasNext:
        query.page < totalPages,
      hasPrevious:
        query.page > 1,
    },
  };
}

export async function getBrowseDonationByIdService(
  requesterId: string,
  listingId: string,
) {
  const listing =
    await prisma.donationListing.findFirst({
      where: {
        id: listingId,

        donorId: {
          not: requesterId,
        },

        status:
          DonationListingStatus.AVAILABLE,

        foodItem: {
          is: {
            status:
              FoodItemStatus.RESERVED,

            expiryDate: {
              gte: startOfTodayUtc(),
            },
          },
        },
      },

      select:
        browseListingSelect(
          requesterId,
        ),
    });

  if (!listing) {
    throw new ApiError(
      404,
      "Donation listing was not found or is no longer available.",
    );
  }

  return {
    id: listing.id,
    pickupLocation:
      listing.pickupLocation,
    availabilityDetails:
      listing.availabilityDetails,
    notes: listing.notes,
    status: listing.status,
    createdAt:
      listing.createdAt.toISOString(),
    updatedAt:
      listing.updatedAt.toISOString(),
    donor: listing.donor,
    foodItem:
      mapFoodItem(
        listing.foodItem,
      ),
    requestCount:
      listing._count.requests,
    currentRequest:
      listing.requests[0]
        ? {
            ...listing.requests[0],
            createdAt:
              listing.requests[0]
                .createdAt
                .toISOString(),
          }
        : null,
  };
}

export async function createDonationRequestService(
  requesterId: string,
  listingId: string,
  input: CreateDonationRequestInput,
) {
  try {
    const request =
      await withSerializableRetry(
        async (transaction) => {
          const listing =
            await transaction
              .donationListing
              .findFirst({
                where: {
                  id: listingId,

                  donorId: {
                    not: requesterId,
                  },

                  status:
                    DonationListingStatus.AVAILABLE,

                  foodItem: {
                    is: {
                      status:
                        FoodItemStatus.RESERVED,

                      expiryDate: {
                        gte: startOfTodayUtc(),
                      },
                    },
                  },
                },

                select: {
                  id: true,
                },
              });

          if (!listing) {
            throw new ApiError(
              409,
              "This donation is no longer available.",
            );
          }

          return transaction
            .donationRequest
            .create({
              data: {
                listingId:
                  listing.id,
                requesterId,
                message:
                  input.message ??
                  null,
                status:
                  DonationRequestStatus.PENDING,
              },

              select:
                requestSelect,
            });
        },
      );

    return mapRequest(request);
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        409,
        "You have already requested this donation.",
      );
    }

    throw error;
  }
}

export async function getMyRequestsService(
  requesterId: string,
  query: MyRequestsQuery,
) {
  const where:
    Prisma.DonationRequestWhereInput = {
      requesterId,
    };

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      {
        listing: {
          is: {
            foodItem: {
              is: {
                itemName: {
                  contains:
                    query.search,
                  mode:
                    "insensitive",
                },
              },
            },
          },
        },
      },
      {
        listing: {
          is: {
            pickupLocation: {
              contains:
                query.search,
              mode:
                "insensitive",
            },
          },
        },
      },
    ];
  }

  const skip =
    (query.page - 1) *
    query.size;

  const [items, total] =
    await prisma.$transaction([
      prisma.donationRequest.findMany({
        where,
        select: requestSelect,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: query.size,
      }),

      prisma.donationRequest.count({
        where,
      }),
    ]);

  const totalPages =
    total === 0
      ? 0
      : Math.ceil(
          total / query.size,
        );

  return {
    items:
      items.map(mapRequest),

    pagination: {
      page: query.page,
      size: query.size,
      totalItems: total,
      totalPages,
      hasNext:
        query.page < totalPages,
      hasPrevious:
        query.page > 1,
    },
  };
}


async function acceptRequest(
  donorId: string,
  requestId: string,
) {
  return withSerializableRetry(
    async (transaction) => {
      const request =
        await transaction
          .donationRequest
          .findFirst({
            where: {
              id: requestId,

              listing: {
                is: {
                  donorId,
                },
              },
            },

            select: {
              id: true,
              status: true,
              listingId: true,

              listing: {
                select: {
                  status: true,
                },
              },
            },
          });

      if (!request) {
        throw new ApiError(
          404,
          "Donation request was not found.",
        );
      }

      if (
        request.status !==
        DonationRequestStatus.PENDING
      ) {
        throw new ApiError(
          409,
          "Only pending requests can be accepted.",
        );
      }

      if (
        request.listing.status !==
        DonationListingStatus.AVAILABLE
      ) {
        throw new ApiError(
          409,
          "This donation is no longer available.",
        );
      }

      const reservedListing =
        await transaction
          .donationListing
          .updateMany({
            where: {
              id: request.listingId,
              donorId,
              status:
                DonationListingStatus.AVAILABLE,
            },

            data: {
              status:
                DonationListingStatus.RESERVED,
            },
          });

      if (
        reservedListing.count !== 1
      ) {
        throw new ApiError(
          409,
          "Another request has already been accepted.",
        );
      }

      const acceptedRequest =
        await transaction
          .donationRequest
          .updateMany({
            where: {
              id: request.id,
              status:
                DonationRequestStatus.PENDING,
            },

            data: {
              status:
                DonationRequestStatus.ACCEPTED,
              respondedAt:
                new Date(),
            },
          });

      if (
        acceptedRequest.count !== 1
      ) {
        throw new ApiError(
          409,
          "The request changed before it could be accepted.",
        );
      }

      await transaction
        .donationRequest
        .updateMany({
          where: {
            listingId:
              request.listingId,

            id: {
              not: request.id,
            },

            status:
              DonationRequestStatus.PENDING,
          },

          data: {
            status:
              DonationRequestStatus.REJECTED,
            respondedAt:
              new Date(),
          },
        });

      return transaction
        .donationRequest
        .findUniqueOrThrow({
          where: {
            id: request.id,
          },
          select: requestSelect,
        });
    },
  );
}

async function rejectRequest(
  donorId: string,
  requestId: string,
) {
  return withSerializableRetry(
    async (transaction) => {
      const request =
        await transaction.donationRequest.findFirst({
          where: {
            id: requestId,

            listing: {
              is: {
                donorId,
              },
            },
          },

          select: {
            id: true,
          },
        });

      if (!request) {
        throw new ApiError(
          404,
          "Donation request was not found.",
        );
      }

      const updated =
        await transaction.donationRequest.updateMany({
          where: {
            id: request.id,
            status: DonationRequestStatus.PENDING,
          },

          data: {
            status: DonationRequestStatus.REJECTED,
            respondedAt: new Date(),
          },
        });

      if (updated.count !== 1) {
        throw new ApiError(
          409,
          "Only pending requests can be rejected.",
        );
      }

      return transaction.donationRequest.findUniqueOrThrow({
        where: {
          id: request.id,
        },

        select: requestSelect,
      });
    },
  );
}

async function claimRequest(
  requesterId: string,
  requestId: string,
) {
  return withSerializableRetry(
    async (transaction) => {
      const request =
        await transaction
          .donationRequest
          .findFirst({
            where: {
              id: requestId,
              requesterId,
            },

            select: {
              id: true,
              status: true,
              listingId: true,

              listing: {
                select: {
                  status: true,
                  foodItemId: true,
                },
              },
            },
          });

      if (!request) {
        throw new ApiError(
          404,
          "Donation request was not found.",
        );
      }

      if (
        request.status !==
        DonationRequestStatus.ACCEPTED
      ) {
        throw new ApiError(
          409,
          "Only an accepted request can be claimed.",
        );
      }

      if (
        request.listing.status !==
        DonationListingStatus.RESERVED
      ) {
        throw new ApiError(
          409,
          "This donation is not ready to be claimed.",
        );
      }

      const claimedRequest =
        await transaction
          .donationRequest
          .updateMany({
            where: {
              id: request.id,
              requesterId,
              status:
                DonationRequestStatus.ACCEPTED,
            },

            data: {
              status:
                DonationRequestStatus.CLAIMED,
              claimedAt:
                new Date(),
            },
          });

      if (
        claimedRequest.count !== 1
      ) {
        throw new ApiError(
          409,
          "The request could not be claimed.",
        );
      }

      const completedListing =
        await transaction
          .donationListing
          .updateMany({
            where: {
              id: request.listingId,
              status:
                DonationListingStatus.RESERVED,
            },

            data: {
              status:
                DonationListingStatus.COMPLETED,
              completedAt:
                new Date(),
            },
          });

      if (
        completedListing.count !== 1
      ) {
        throw new ApiError(
          409,
          "The donation listing could not be completed.",
        );
      }

      const donatedFood =
        await transaction
          .foodItem
          .updateMany({
            where: {
              id:
                request.listing
                  .foodItemId,

              status:
                FoodItemStatus.RESERVED,
            },

            data: {
              status:
                FoodItemStatus.DONATED,
            },
          });

      if (donatedFood.count !== 1) {
        throw new ApiError(
          409,
          "The inventory item could not be marked as donated.",
        );
      }

      return transaction
        .donationRequest
        .findUniqueOrThrow({
          where: {
            id: request.id,
          },
          select: requestSelect,
        });
    },
  );
}

async function cancelOwnRequest(
  requesterId: string,
  requestId: string,
) {
  const request =
    await prisma.donationRequest.findFirst({
      where: {
        id: requestId,
        requesterId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!request) {
    throw new ApiError(
      404,
      "Donation request was not found.",
    );
  }

  if (
    request.status !==
    DonationRequestStatus.PENDING
  ) {
    throw new ApiError(
      409,
      "Only pending requests can be cancelled.",
    );
  }

  return prisma.donationRequest.update({
    where: {
      id: request.id,
    },

    data: {
      status:
        DonationRequestStatus.CANCELLED,
      cancelledAt:
        new Date(),
    },

    select: requestSelect,
  });
}

export async function performDonationRequestActionService(
  actorId: string,
  requestId: string,
  input: DonationRequestActionInput,
) {
  let request: RequestRow;

  switch (input.action) {
    case "ACCEPT":
      request =
        await acceptRequest(
          actorId,
          requestId,
        );
      break;

    case "REJECT":
      request =
        await rejectRequest(
          actorId,
          requestId,
        );
      break;

    case "CLAIM":
      request =
        await claimRequest(
          actorId,
          requestId,
        );
      break;

    case "CANCEL":
      request =
        await cancelOwnRequest(
          actorId,
          requestId,
        );
      break;

    default:
      throw new ApiError(
        400,
        "Unsupported request action.",
      );
  }

  return mapRequest(request);
}